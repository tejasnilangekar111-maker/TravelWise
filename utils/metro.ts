import { METRO_SLABS, ROAD_DETOUR_FACTOR, TRANSIT_SLABS } from '../constants/pricing';
import { INTERCHANGE, METRO_LINES } from '../data/metroLines';
import type { MetroLine, MetroStation } from '../data/metroLines';
import type { GeoPoint } from '../types/travel';
import { haversineKm } from './geo';

/**
 * Plans a metro journey between two points using the real Pune Metro network.
 * Returns null when no station is reachable at either end, so the metro is
 * only ever suggested where it actually serves the trip.
 */

/** Stations closer than this (by road) are reached on foot. */
const WALK_MAX_KM = 1.2;
/** Beyond walking distance, a feeder bus can reach a station up to this far. */
const FEEDER_MAX_KM = 8;
const WALK_KMH = 4.5;
const BUS_KMH = 18;
/** Walk to the bus stop plus the wait for a bus. */
const BUS_OVERHEAD_MIN = 8;
/** Security check, stairs and the wait for a train. */
const STATION_ENTRY_MIN = 5;
/** Average time per station, including the stop. */
const MIN_PER_STOP = 2.2;
const INTERCHANGE_MIN = 6;

export interface AccessLeg {
  mode: 'walk' | 'bus';
  km: number;
  minutes: number;
}

export interface MetroRide {
  line: string;
  from: string;
  to: string;
  stops: number;
  minutes: number;
}

export interface MetroPlan {
  access: AccessLeg;
  /** One ride, or two with a change at the interchange. */
  rides: MetroRide[];
  egress: AccessLeg;
  totalMinutes: number;
  fare: number;
}

const slabFare = (slabs: { upToKm: number; fare: number }[], km: number) =>
  slabs.find((s) => km <= s.upToKm)!.fare;

/** How to get between a point and a station, or null if it's too far. */
function accessLeg(point: GeoPoint, station: MetroStation, trafficRatio: number): AccessLeg | null {
  const km = haversineKm(point, station) * ROAD_DETOUR_FACTOR;
  if (km <= WALK_MAX_KM) return { mode: 'walk', km, minutes: Math.max(2, Math.round((km / WALK_KMH) * 60)) };
  if (km <= FEEDER_MAX_KM) {
    return { mode: 'bus', km, minutes: Math.round(BUS_OVERHEAD_MIN + (km / BUS_KMH) * 60 * trafficRatio) };
  }
  return null;
}

function rideKm(line: MetroLine, a: number, b: number): number {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  let km = 0;
  for (let i = lo; i < hi; i++) km += haversineKm(line.stations[i], line.stations[i + 1]);
  return km;
}

function ride(line: MetroLine, a: number, b: number): MetroRide {
  const stops = Math.abs(a - b);
  return {
    line: line.name,
    from: line.stations[a].name,
    to: line.stations[b].name,
    stops,
    minutes: Math.round(stops * MIN_PER_STOP),
  };
}

/** Rides between two stations, changing lines at the interchange if needed. */
function ridesBetween(
  boardLine: MetroLine,
  boardIdx: number,
  alightLine: MetroLine,
  alightIdx: number,
): { rides: MetroRide[]; km: number } | null {
  if (boardLine === alightLine) {
    if (boardIdx === alightIdx) return null;
    return { rides: [ride(boardLine, boardIdx, alightIdx)], km: rideKm(boardLine, boardIdx, alightIdx) };
  }
  const x1 = boardLine.stations.findIndex((s) => s.name === INTERCHANGE);
  const x2 = alightLine.stations.findIndex((s) => s.name === INTERCHANGE);
  // Boarding or alighting at the interchange itself is a single ride on the other line.
  if (boardIdx === x1) return ridesBetween(alightLine, x2, alightLine, alightIdx);
  if (alightIdx === x2) return ridesBetween(boardLine, boardIdx, boardLine, x1);
  return {
    rides: [ride(boardLine, boardIdx, x1), ride(alightLine, x2, alightIdx)],
    km: rideKm(boardLine, boardIdx, x1) + rideKm(alightLine, x2, alightIdx),
  };
}

/** The fastest metro journey from `from` to `to`, or null if the metro doesn't serve it. */
export function planMetro(from: GeoPoint, to: GeoPoint, trafficRatio = 1): MetroPlan | null {
  const stations = METRO_LINES.flatMap((line) => line.stations.map((s, idx) => ({ line, s, idx })));
  let best: MetroPlan | null = null;

  for (const board of stations) {
    const access = accessLeg(from, board.s, trafficRatio);
    if (!access) continue;
    for (const alight of stations) {
      const egress = accessLeg(to, alight.s, trafficRatio);
      if (!egress) continue;
      const route = ridesBetween(board.line, board.idx, alight.line, alight.idx);
      if (!route) continue;

      const rideMinutes = route.rides.reduce((sum, r) => sum + r.minutes, 0);
      const totalMinutes =
        access.minutes + STATION_ENTRY_MIN + rideMinutes + (route.rides.length - 1) * INTERCHANGE_MIN + egress.minutes;
      if (best && totalMinutes >= best.totalMinutes) continue;

      const fare =
        slabFare(METRO_SLABS, route.km) +
        (access.mode === 'bus' ? slabFare(TRANSIT_SLABS, access.km) : 0) +
        (egress.mode === 'bus' ? slabFare(TRANSIT_SLABS, egress.km) : 0);
      best = { access, rides: route.rides, egress, totalMinutes, fare };
    }
  }
  return best;
}

export const METRO_TIMING = { STATION_ENTRY_MIN, INTERCHANGE_MIN };
