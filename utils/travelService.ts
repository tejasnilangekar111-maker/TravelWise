import { MOCK_ROUTES } from '../data/travelOptions';
import type { DemoScenario, Place, TravelResults, TravelSearch } from '../types/travel';
import { routeTitle } from './format';
import { geocode } from './geo';
import { generateRoute } from './routeGenerator';
import { getTripMetrics } from './routing';

/**
 * Travel service. Distance and timings come from TomTom (via utils/routing.ts);
 * fares are computed locally. Screens only depend on this function's contract.
 */

/** Keeps the loading state from flashing when results come from cache. */
const MIN_LATENCY_MS = 600;

export class TravelServiceError extends Error {}

export type SearchValidation = { from?: string; to?: string; time?: string };

export function validateSearch(search: TravelSearch): SearchValidation {
  const errors: SearchValidation = {};
  if (!search.from.trim()) errors.from = 'Please enter your starting location.';
  if (!search.to.trim()) errors.to = 'Please enter your destination.';
  if (search.departAt && search.departAt.getTime() < Date.now() - 60_000) {
    errors.time = 'That time has already passed. Pick a later time or leave now.';
  }
  return errors;
}

/** Curated routes all start from Hadapsar; any other pair is generated. */
function resolveCuratedRouteId(from: string, to: string): string | undefined {
  if (!from.toLowerCase().replace(/[^a-z]/g, '').includes('hadapsar')) return undefined;
  const key = to.toLowerCase().replace(/[^a-z]/g, '');
  if (key.includes('kharadi')) return 'kharadi';
  if (key.includes('fcroad') || key.includes('fergusson')) return 'fcroad';
  if (key.includes('vanaz')) return 'vanaz';
  return undefined;
}

export async function fetchTravelOptions(
  search: TravelSearch,
  scenario: DemoScenario = 'normal',
): Promise<TravelResults> {
  const minDelay = new Promise((r) => setTimeout(r, MIN_LATENCY_MS));

  if (scenario === 'failure') {
    await minDelay;
    throw new TravelServiceError('Unable to load travel options. Please try again.');
  }

  const [route] = await Promise.all([resolveRoute(search), minDelay]);
  return {
    ...route,
    routeLabel: routeTitle(search.from, search.to),
    options: scenario === 'empty' ? [] : route.options,
  };
}

async function resolveRoute(search: TravelSearch): Promise<Omit<TravelResults, 'routeLabel'>> {
  let places: [Place | null, Place | null] = [null, null];
  try {
    places = await Promise.all([
      search.fromPlace ?? geocode(search.from),
      search.toPlace ?? geocode(search.to),
    ]);
  } catch {
    // Offline or Photon is down — fall through to the offline data below.
  }

  const [from, to] = places;
  if (from && to) {
    const metrics = await getTripMetrics(from, to, search.departAt);
    return {
      ...generateRoute(search.from, search.to, search.departAt, metrics, { from, to }),
      route: { from, to, path: metrics.path ?? [from, to], source: metrics.source },
    };
  }

  const curatedId = resolveCuratedRouteId(search.from, search.to);
  return curatedId ? MOCK_ROUTES[curatedId] : generateRoute(search.from, search.to, search.departAt);
}
