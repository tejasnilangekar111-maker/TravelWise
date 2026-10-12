import { ROAD_DETOUR_FACTOR } from '../constants/pricing';
import type { GeoPoint, TripMetrics } from '../types/travel';
import { haversineKm } from './geo';

/**
 * Road distance and traffic-aware travel times from the TomTom Routing API
 * (free tier). Falls back to a straight-line estimate when there's no API key,
 * no network, or TomTom can't route the trip.
 */

const TOMTOM_KEY = process.env.EXPO_PUBLIC_TOMTOM_API_KEY;
const ROUTING_URL = 'https://api.tomtom.com/routing/1/calculateRoute';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface RouteSummary {
  lengthInMeters: number;
  travelTimeInSeconds: number;
  noTrafficTravelTimeInSeconds?: number;
}

interface TomTomRoute {
  summary: RouteSummary;
  legs?: { points: { latitude: number; longitude: number }[] }[];
}

/** Map polylines don't need every vertex; keeping ~150 keeps rendering light. */
const MAX_PATH_POINTS = 150;

function simplifyPath(points: GeoPoint[]): GeoPoint[] {
  if (points.length <= MAX_PATH_POINTS) return points;
  const step = (points.length - 1) / (MAX_PATH_POINTS - 1);
  return Array.from({ length: MAX_PATH_POINTS }, (_, i) => points[Math.round(i * step)]);
}

const cache = new Map<string, { at: number; metrics: TripMetrics }>();

/** "8:30 AM" → the next time that clock time occurs; "Now" or unparseable → null. */
export function nextOccurrence(clock: string, now = new Date()): Date | null {
  const m = clock.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') hours += 12;
  const d = new Date(now);
  d.setHours(hours, Number(m[2]), 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

async function tomtomRoute(
  from: GeoPoint,
  to: GeoPoint,
  travelMode: 'car' | 'motorcycle',
  departAt: string,
  withPath: boolean,
  signal?: AbortSignal,
): Promise<TomTomRoute> {
  const params = new URLSearchParams({
    key: TOMTOM_KEY ?? '',
    travelMode,
    traffic: 'true',
    departAt,
    computeTravelTimeFor: 'all',
    routeRepresentation: withPath ? 'polyline' : 'summaryOnly',
  });
  const url = `${ROUTING_URL}/${from.lat},${from.lon}:${to.lat},${to.lon}/json?${params}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`TomTom routing failed (${res.status})`);
  const json: { routes?: TomTomRoute[] } = await res.json();
  const route = json.routes?.[0];
  if (!route) throw new Error('TomTom returned no route');
  return route;
}

const minutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));

/** Rough city speeds for the offline estimate. */
function estimateMetrics(from: GeoPoint, to: GeoPoint): TripMetrics {
  const distanceKm = Math.round(haversineKm(from, to) * ROAD_DETOUR_FACTOR * 10) / 10;
  const freeFlowMinutes = Math.max(3, Math.round((distanceKm / 30) * 60));
  return {
    distanceKm,
    freeFlowMinutes,
    driveMinutes: Math.round(freeFlowMinutes * 1.25),
    twoWheelerMinutes: Math.max(3, Math.round((distanceKm / 28) * 60)),
    source: 'estimated',
  };
}

export async function getTripMetrics(
  from: GeoPoint,
  to: GeoPoint,
  departAt: Date | null,
  signal?: AbortSignal,
): Promise<TripMetrics> {
  // TomTom rejects departure times in the past, so a stale time means "now".
  const depart = departAt && departAt.getTime() > Date.now() + 60_000 ? departAt : null;
  const departKey = depart ? Math.floor(depart.getTime() / 60_000) : 'now';
  const key = [from.lat, from.lon, to.lat, to.lon].map((n) => n.toFixed(5)).join(',') + `|${departKey}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.metrics;

  if (!TOMTOM_KEY) return estimateMetrics(from, to);

  const departParam = depart ? depart.toISOString().replace(/\.\d{3}Z$/, 'Z') : 'now';

  try {
    const [car, bike] = await Promise.all([
      tomtomRoute(from, to, 'car', departParam, true, signal),
      tomtomRoute(from, to, 'motorcycle', departParam, false, signal),
    ]);
    const { summary } = car;
    const path = (car.legs ?? []).flatMap((leg) =>
      leg.points.map((p) => ({ lat: p.latitude, lon: p.longitude })),
    );
    const metrics: TripMetrics = {
      distanceKm: Math.round(summary.lengthInMeters / 100) / 10,
      driveMinutes: minutes(summary.travelTimeInSeconds),
      freeFlowMinutes: minutes(summary.noTrafficTravelTimeInSeconds ?? summary.travelTimeInSeconds),
      twoWheelerMinutes: minutes(bike.summary.travelTimeInSeconds),
      source: 'live',
      path: path.length > 1 ? simplifyPath(path) : undefined,
    };
    cache.set(key, { at: Date.now(), metrics });
    return metrics;
  } catch (err) {
    if (signal?.aborted) throw err;
    return estimateMetrics(from, to);
  }
}
