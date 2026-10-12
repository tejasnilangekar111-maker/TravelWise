import type { Conditions, TravelOption, TravelResults } from '../types/travel';

/**
 * Mock travel data. All durations and prices are illustrative estimates only.
 * Keyed by a route id resolved in utils/travelService.ts.
 */

const rushHourRain: Conditions = { traffic: 'High', weather: 'Light Rain', demand: 'High' };

const hadapsarToVanaz: TravelOption[] = [
  {
    mode: 'PUBLIC_TRANSPORT',
    duration: '55 min',
    maxMinutes: 55,
    minCost: 30,
    maxCost: 50,
    badges: ['Cheapest', 'Most predictable'],
    summary: 'PMPML bus + Aqua Line metro',
    details: {
      type: 'PUBLIC_TRANSPORT',
      transfers: 1,
      walkingMinutes: 10,
      steps: [
        { kind: 'walk', label: 'Walk to Hadapsar Gadital bus stop', minutes: 5 },
        { kind: 'bus', label: 'PMPML bus to Pune Railway Station', minutes: 28 },
        { kind: 'walk', label: 'Walk to Pune Railway Station metro', minutes: 5 },
        { kind: 'metro', label: 'Aqua Line metro to Vanaz', minutes: 17 },
      ],
    },
  },
  {
    mode: 'CAB',
    duration: '35–45 min',
    maxMinutes: 45,
    minCost: 310,
    maxCost: 360,
    badges: ['Fastest', 'Comfortable'],
    alert: 'High demand',
    summary: 'Door-to-door via Solapur Rd & Karve Rd',
    details: { type: 'CAB', demand: 'High', pickupEta: '4–8 min' },
  },
  {
    mode: 'TWO_WHEELER',
    duration: '32 min',
    maxMinutes: 32,
    minCost: 70,
    maxCost: 90,
    badges: [],
    alert: 'Wet roads',
    summary: 'Bike taxi or own vehicle',
    details: {
      type: 'TWO_WHEELER',
      distanceKm: 16.4,
      note: 'Light rain expected — carry rain gear and allow extra braking distance.',
    },
  },
  {
    mode: 'CARPOOL',
    duration: '40 min',
    maxMinutes: 40,
    minCost: 100,
    maxCost: 150,
    badges: ['Shared ride'],
    summary: 'Shared car with verified commuters',
    details: {
      type: 'CARPOOL',
      availableSeats: 2,
      departureTime: '8:40 AM',
      pickupPoint: 'Magarpatta City Gate 1',
    },
  },
];

const hadapsarToKharadi: TravelOption[] = [
  {
    mode: 'PUBLIC_TRANSPORT',
    duration: '45 min',
    maxMinutes: 45,
    minCost: 20,
    maxCost: 35,
    badges: ['Cheapest'],
    summary: 'PMPML bus via Mundhwa',
    details: {
      type: 'PUBLIC_TRANSPORT',
      transfers: 0,
      walkingMinutes: 12,
      steps: [
        { kind: 'walk', label: 'Walk to Hadapsar bus depot', minutes: 6 },
        { kind: 'bus', label: 'PMPML bus to Kharadi Bypass', minutes: 33 },
        { kind: 'walk', label: 'Walk to EON IT Park', minutes: 6 },
      ],
    },
  },
  {
    mode: 'CAB',
    duration: '22–30 min',
    maxMinutes: 30,
    minCost: 170,
    maxCost: 220,
    badges: ['Comfortable'],
    alert: 'High demand',
    summary: 'Door-to-door via Mundhwa Rd',
    details: { type: 'CAB', demand: 'High', pickupEta: '3–6 min' },
  },
  {
    mode: 'TWO_WHEELER',
    duration: '20 min',
    maxMinutes: 20,
    minCost: 45,
    maxCost: 60,
    badges: ['Fastest'],
    summary: 'Bike taxi or own vehicle',
    details: {
      type: 'TWO_WHEELER',
      distanceKm: 9.2,
      note: 'Mundhwa bridge is slow at peak hours — expect short stop-and-go.',
    },
  },
  {
    mode: 'CARPOOL',
    duration: '28 min',
    maxMinutes: 28,
    minCost: 60,
    maxCost: 90,
    badges: ['Shared ride', 'Most predictable'],
    summary: 'Office carpool from Magarpatta',
    details: {
      type: 'CARPOOL',
      availableSeats: 3,
      departureTime: '8:35 AM',
      pickupPoint: 'Amanora Mall, Gate 3',
    },
  },
];

const hadapsarToFcRoad: TravelOption[] = [
  {
    mode: 'PUBLIC_TRANSPORT',
    duration: '50 min',
    maxMinutes: 50,
    minCost: 25,
    maxCost: 45,
    badges: ['Cheapest', 'Most predictable'],
    summary: 'PMPML bus + Aqua Line metro',
    details: {
      type: 'PUBLIC_TRANSPORT',
      transfers: 1,
      walkingMinutes: 14,
      steps: [
        { kind: 'walk', label: 'Walk to Hadapsar Gadital bus stop', minutes: 5 },
        { kind: 'bus', label: 'PMPML bus to Pune Railway Station', minutes: 28 },
        { kind: 'metro', label: 'Aqua Line metro to Deccan Gymkhana', minutes: 8 },
        { kind: 'walk', label: 'Walk to FC Road', minutes: 9 },
      ],
    },
  },
  {
    mode: 'CAB',
    duration: '30–40 min',
    maxMinutes: 40,
    minCost: 260,
    maxCost: 310,
    badges: ['Fastest', 'Comfortable'],
    alert: 'High demand',
    summary: 'Door-to-door via Shivaji Nagar',
    details: { type: 'CAB', demand: 'High', pickupEta: '4–8 min' },
  },
  {
    mode: 'TWO_WHEELER',
    duration: '30 min',
    maxMinutes: 30,
    minCost: 60,
    maxCost: 80,
    badges: [],
    summary: 'Bike taxi or own vehicle',
    details: {
      type: 'TWO_WHEELER',
      distanceKm: 13.1,
      note: 'Parking on FC Road is limited — consider a bike taxi.',
    },
  },
  {
    mode: 'CARPOOL',
    duration: '38 min',
    maxMinutes: 38,
    minCost: 90,
    maxCost: 130,
    badges: ['Shared ride'],
    summary: 'Shared car with verified commuters',
    details: {
      type: 'CARPOOL',
      availableSeats: 1,
      departureTime: '8:45 AM',
      pickupPoint: 'Hadapsar Gadital',
    },
  },
];

export const MOCK_ROUTES: Record<string, Omit<TravelResults, 'routeLabel'>> = {
  vanaz: { distanceKm: 16.4, conditions: rushHourRain, options: hadapsarToVanaz },
  kharadi: {
    distanceKm: 9.2,
    conditions: { traffic: 'Moderate', weather: 'Light Rain', demand: 'High' },
    options: hadapsarToKharadi,
  },
  fcroad: {
    distanceKm: 13.1,
    conditions: { traffic: 'High', weather: 'Cloudy', demand: 'Moderate' },
    options: hadapsarToFcRoad,
  },
};

