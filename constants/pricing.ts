/**
 * Fare rules, in rupees. Illustrative Pune-style rates — tune these without
 * touching the routing code. Fares = base + per-km × distance + per-min × time.
 */

export const CAB_FARE = {
  base: 50,
  perKm: 14,
  perMinute: 1.5,
  minimum: 100,
  /** Applied when traffic makes the trip this much slower than empty roads. */
  surgeTrafficRatio: 1.3,
  surgeMultiplier: 1.2,
  /** Extra multiplier during PEAK_HOURS. */
  peakMultiplier: 1.1,
};

export const TWO_WHEELER_FARE = {
  base: 20,
  perKm: 5,
  perMinute: 0.5,
  minimum: 30,
};

export const CARPOOL_FARE = {
  /** Share of the cab fare each rider pays. */
  shareOfCab: 0.45,
  minimum: 60,
};

/** PMPML bus fares by distance slab. */
export const TRANSIT_SLABS: { upToKm: number; fare: number }[] = [
  { upToKm: 2, fare: 10 },
  { upToKm: 5, fare: 15 },
  { upToKm: 10, fare: 20 },
  { upToKm: 15, fare: 25 },
  { upToKm: 20, fare: 30 },
  { upToKm: Infinity, fare: 35 },
];

/** Pune Metro fares by distance travelled on the metro (approximate). */
export const METRO_SLABS: { upToKm: number; fare: number }[] = [
  { upToKm: 2, fare: 10 },
  { upToKm: 4, fare: 15 },
  { upToKm: 12, fare: 20 },
  { upToKm: 18, fare: 25 },
  { upToKm: 24, fare: 30 },
  { upToKm: Infinity, fare: 35 },
];

/** Local-time hour ranges [start, end) treated as peak. */
export const PEAK_HOURS: [number, number][] = [
  [8, 11],
  [17, 21],
];

/** Straight-line km × this ≈ road km, used when live routing is unavailable. */
export const ROAD_DETOUR_FACTOR = 1.35;
