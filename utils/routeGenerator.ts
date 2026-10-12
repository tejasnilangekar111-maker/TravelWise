import {
  CAB_FARE,
  CARPOOL_FARE,
  PEAK_HOURS,
  TRANSIT_SLABS,
  TWO_WHEELER_FARE,
} from '../constants/pricing';
import type {
  Conditions,
  GeoPoint,
  JourneyStep,
  Level,
  TradeOff,
  TravelOption,
  TravelResults,
  TripMetrics,
} from '../types/travel';
import { formatClock, shortPlace } from './format';
import { METRO_TIMING, planMetro } from './metro';
import type { MetroPlan } from './metro';

/**
 * Builds results for any From/To pair from trip metrics (real road distance and
 * traffic-aware times). Fares follow constants/pricing.ts. Without metrics the
 * distance is derived from a hash of the two places, so the same search always
 * returns the same numbers. Cosmetic details (weather, seats) are always hashed.
 */

/** Cab fares are shown as a range no wider than this. */
export const CAB_FARE_SPREAD = 50;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const normalize = (place: string) => place.toLowerCase().replace(/[^a-z0-9]/g, '');
const roundTo = (n: number, step: number) => Math.max(step, Math.round(n / step) * step);
const pick = <T,>(items: T[], seed: number) => items[seed % items.length];

const LEVELS: Level[] = ['Low', 'Moderate', 'High'];
const WEATHER = ['Clear', 'Cloudy', 'Light Rain', 'Sunny'];

/** Offline stand-in for TripMetrics when no coordinates or routing are available. */
function hashedMetrics(seed: number): TripMetrics {
  const distanceKm = Math.round(40 + (seed % 200)) / 10; // 4.0 – 23.9 km
  const traffic = pick(LEVELS, seed >>> 3);
  const factor = traffic === 'High' ? 1.5 : traffic === 'Moderate' ? 1.25 : 1.05;
  const freeFlowMinutes = Math.round((distanceKm / 30) * 60);
  return {
    distanceKm,
    freeFlowMinutes,
    driveMinutes: Math.round(freeFlowMinutes * factor),
    twoWheelerMinutes: Math.round((distanceKm / 28) * 60),
    source: 'estimated',
  };
}

function isPeak(departAt: Date): boolean {
  const hour = departAt.getHours();
  return PEAK_HOURS.some(([start, end]) => hour >= start && hour < end);
}

const transitFare = (km: number) => TRANSIT_SLABS.find((s) => km <= s.upToKm)!.fare;

/** The metro must beat a direct bus by at least this much to be suggested. */
const METRO_MIN_SAVING = 5;

/** Turns a metro plan into journey steps: get to the station, ride, get to the destination. */
function metroSteps(plan: MetroPlan, origin: string, destination: string): JourneyStep[] {
  const board = plan.rides[0].from;
  const steps: JourneyStep[] = [];
  if (plan.access.mode === 'walk') {
    steps.push({ kind: 'walk', label: `Walk to ${board} metro station`, minutes: plan.access.minutes });
  } else {
    steps.push({ kind: 'walk', label: `Walk to ${origin} bus stop`, minutes: 4 });
    steps.push({ kind: 'bus', label: `PMPML bus to ${board} metro station`, minutes: plan.access.minutes - 4 });
  }
  plan.rides.forEach((r, i) => {
    if (i > 0) {
      steps.push({ kind: 'walk', label: `Change to the ${r.line} at ${r.from}`, minutes: METRO_TIMING.INTERCHANGE_MIN });
    }
    const stops = `${r.stops} stop${r.stops === 1 ? '' : 's'}`;
    // Station entry (security, platform wait) is part of the first ride.
    const minutes = r.minutes + (i === 0 ? METRO_TIMING.STATION_ENTRY_MIN : 0);
    steps.push({ kind: 'metro', label: `${r.line} to ${r.to} (${stops})`, minutes });
  });
  if (plan.egress.mode === 'walk') {
    steps.push({ kind: 'walk', label: `Walk to ${destination}`, minutes: plan.egress.minutes });
  } else {
    steps.push({ kind: 'bus', label: `PMPML bus to ${destination}`, minutes: plan.egress.minutes - 4 });
    steps.push({ kind: 'walk', label: `Walk to ${destination}`, minutes: 4 });
  }
  return steps;
}

export function generateRoute(
  from: string,
  to: string,
  departAt: Date | null,
  metrics?: TripMetrics,
  /** Where the trip starts and ends. Without them the metro is never suggested. */
  points?: { from: GeoPoint; to: GeoPoint },
): Omit<TravelResults, 'routeLabel'> {
  // Order-independent so A → B and B → A get the same cosmetic details.
  const [a, b] = [normalize(from), normalize(to)].sort();
  const seed = hash(`${a}|${b}`);
  const trip = metrics ?? hashedMetrics(seed);
  const { distanceKm, driveMinutes, freeFlowMinutes } = trip;
  const origin = shortPlace(from);
  const destination = shortPlace(to);

  const trafficRatio = driveMinutes / Math.max(1, freeFlowMinutes);
  const traffic: Level = trafficRatio >= 1.4 ? 'High' : trafficRatio >= 1.15 ? 'Moderate' : 'Low';
  const leaving = departAt ?? new Date();
  const peak = isPeak(leaving);
  const demand: Level = peak && traffic !== 'Low' ? 'High' : peak || traffic !== 'Low' ? 'Moderate' : 'Low';
  const hour = leaving.getHours();
  const night = hour < 6 || hour >= 19;
  const sky = pick(WEATHER, seed >>> 11);
  const conditions: Conditions = { traffic, weather: night && sky === 'Sunny' ? 'Clear' : sky, demand };

  // Public transport: a direct PMPML bus, or the metro when a real station
  // serves both ends and it's clearly faster. Buses crawl at ~18 km/h and
  // share the road, so they slow down with traffic.
  const walkStart = 4 + (seed % 4);
  const walkEnd = 3 + ((seed >>> 5) % 5);
  const busMinutes = Math.round((distanceKm / 18) * 60 * trafficRatio);
  const busSteps: JourneyStep[] = [
    { kind: 'walk', label: `Walk to ${origin} bus stop`, minutes: walkStart },
    { kind: 'bus', label: `PMPML bus to ${destination}`, minutes: busMinutes },
    { kind: 'walk', label: `Walk to ${destination}`, minutes: walkEnd },
  ];
  const busTotal = walkStart + busMinutes + walkEnd;
  const metro = points ? planMetro(points.from, points.to, trafficRatio) : null;
  const useMetro = metro !== null && metro.totalMinutes <= busTotal - METRO_MIN_SAVING;

  const ptSteps = useMetro ? metroSteps(metro, origin, destination) : busSteps;
  const ptMinutes = ptSteps.reduce((sum, st) => sum + st.minutes, 0);
  const ptMin = useMetro ? metro.fare : transitFare(distanceKm);
  const ptVehicles = ptSteps.filter((st) => st.kind !== 'walk').length;
  const metroLines = useMetro ? [...new Set(metro.rides.map((r) => r.line.replace(' Line', '')))] : [];
  const ptSummary = !useMetro
    ? 'PMPML bus'
    : `${ptSteps.some((st) => st.kind === 'bus') ? 'PMPML bus + ' : ''}${metroLines.join(' + ')} Line metro`;

  // Cab: distance + time, with surge when traffic is heavy and a peak-hour bump.
  const surge = trafficRatio >= CAB_FARE.surgeTrafficRatio;
  const cabFare =
    (CAB_FARE.base + CAB_FARE.perKm * distanceKm + CAB_FARE.perMinute * driveMinutes) *
    (surge ? CAB_FARE.surgeMultiplier : 1) *
    (peak ? CAB_FARE.peakMultiplier : 1);
  const cabMin = roundTo(Math.max(CAB_FARE.minimum, cabFare), 10);
  const cabLow = driveMinutes;
  const cabHigh = Math.round(driveMinutes * 1.15) + 2;

  const bikeMinutes = trip.twoWheelerMinutes;
  const bikeMin = roundTo(
    Math.max(
      TWO_WHEELER_FARE.minimum,
      TWO_WHEELER_FARE.base + TWO_WHEELER_FARE.perKm * distanceKm + TWO_WHEELER_FARE.perMinute * bikeMinutes,
    ),
    5,
  );

  // Carpool detours for other riders, so it's a little slower than a cab.
  const poolMinutes = Math.round(driveMinutes * 1.1 + 6);
  const poolMin = roundTo(Math.max(CARPOOL_FARE.minimum, cabFare * CARPOOL_FARE.shareOfCab), 10);

  const options: TravelOption[] = [
    {
      mode: 'PUBLIC_TRANSPORT',
      duration: `${ptMinutes} min`,
      maxMinutes: ptMinutes,
      minCost: ptMin,
      maxCost: ptMin + 10,
      badges: [],
      summary: ptSummary,
      details: {
        type: 'PUBLIC_TRANSPORT',
        transfers: Math.max(0, ptVehicles - 1),
        walkingMinutes: ptSteps.filter((st) => st.kind === 'walk').reduce((sum, st) => sum + st.minutes, 0),
        steps: ptSteps,
      },
    },
    {
      mode: 'CAB',
      duration: `${cabLow}–${cabHigh} min`,
      maxMinutes: cabHigh,
      minCost: cabMin,
      maxCost: cabMin + CAB_FARE_SPREAD,
      badges: ['Comfortable'],
      alert: surge ? 'Surge pricing' : demand === 'High' ? 'High demand' : undefined,
      summary: `Door-to-door from ${origin} to ${destination}`,
      details: { type: 'CAB', demand, pickupEta: demand === 'High' ? '5–9 min' : '3–6 min' },
    },
    {
      mode: 'TWO_WHEELER',
      duration: `${bikeMinutes} min`,
      maxMinutes: bikeMinutes,
      minCost: bikeMin,
      maxCost: bikeMin + 20,
      badges: [],
      alert: conditions.weather === 'Light Rain' ? 'Wet roads' : undefined,
      summary: 'Bike taxi or own vehicle',
      details: {
        type: 'TWO_WHEELER',
        distanceKm,
        note:
          conditions.weather === 'Light Rain'
            ? 'Light rain expected — carry rain gear and allow extra braking distance.'
            : `Check parking availability near ${destination} before you ride.`,
      },
    },
    {
      mode: 'CARPOOL',
      duration: `${poolMinutes} min`,
      maxMinutes: poolMinutes,
      minCost: poolMin,
      maxCost: poolMin + 30,
      badges: ['Shared ride'],
      summary: 'Shared car with verified commuters',
      details: {
        type: 'CARPOOL',
        availableSeats: 1 + (seed % 3),
        // A car leaving 5–20 minutes after the requested time.
        departureTime: formatClock(new Date(leaving.getTime() + pick([5, 10, 15, 20], seed >>> 13) * 60_000)),
        pickupPoint: `${origin} main road`,
      },
    },
  ];

  addTradeOffBadges(options);
  return { distanceKm, distanceSource: trip.source, conditions, options };
}

function addTradeOffBadges(options: TravelOption[]) {
  const fastest = options.reduce((x, y) => (y.maxMinutes < x.maxMinutes ? y : x));
  const cheapest = options.reduce((x, y) => (y.minCost < x.minCost ? y : x));
  const add = (o: TravelOption, badge: TradeOff) => {
    if (!o.badges.includes(badge)) o.badges.unshift(badge);
  };
  add(fastest, 'Fastest');
  add(cheapest, 'Cheapest');
  const transit = options.find((o) => o.mode === 'PUBLIC_TRANSPORT');
  if (transit) transit.badges.push('Most predictable');
}
