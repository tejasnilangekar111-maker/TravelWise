import type { TravelMode } from '../types/travel';

/** Plain-language trade-offs shown on the option details screen. */
export const MODE_TRADEOFFS: Record<TravelMode, { goodFor: string[]; keepInMind: string[] }> = {
  PUBLIC_TRANSPORT: {
    goodFor: ['Lowest cost', 'Metro leg is unaffected by traffic', 'Predictable arrival'],
    keepInMind: ['Includes walking and a transfer', 'Buses can be crowded at peak hours'],
  },
  CAB: {
    goodFor: ['Door-to-door', 'Comfortable in rain', 'No transfers'],
    keepInMind: ['Fares rise with demand', 'Travel time depends on traffic'],
  },
  TWO_WHEELER: {
    goodFor: ['Quick through traffic', 'Low cost for a private ride'],
    keepInMind: ['Exposed to weather', 'Parking may be limited'],
  },
  CARPOOL: {
    goodFor: ['Shared cost', 'More comfortable than bus', 'Fewer cars on the road'],
    keepInMind: ['Fixed departure time', 'Short detours for other riders'],
  },
};
