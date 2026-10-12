export type TravelMode = 'PUBLIC_TRANSPORT' | 'CAB' | 'TWO_WHEELER' | 'CARPOOL';

/** Trade-off labels. TravelWise highlights trade-offs; it never picks a single "best". */
export type TradeOff =
  | 'Fastest'
  | 'Cheapest'
  | 'Comfortable'
  | 'Shared ride'
  | 'Most predictable';

export type Level = 'Low' | 'Moderate' | 'High';

export interface Conditions {
  traffic: Level;
  weather: string;
  demand?: Level;
}

export interface JourneyStep {
  kind: 'walk' | 'bus' | 'metro' | 'ride';
  label: string;
  minutes: number;
}

export interface PublicTransportDetails {
  type: 'PUBLIC_TRANSPORT';
  transfers: number;
  walkingMinutes: number;
  steps: JourneyStep[];
}

export interface CabDetails {
  type: 'CAB';
  demand: Level;
  pickupEta: string;
}

export interface TwoWheelerDetails {
  type: 'TWO_WHEELER';
  distanceKm: number;
  note: string;
}

export interface CarpoolDetails {
  type: 'CARPOOL';
  availableSeats: number;
  departureTime: string;
  pickupPoint: string;
}

export type OptionDetails =
  | PublicTransportDetails
  | CabDetails
  | TwoWheelerDetails
  | CarpoolDetails;

export interface TravelOption {
  mode: TravelMode;
  /** Display duration, e.g. "35–45 min". */
  duration: string;
  /** Upper bound in minutes — used for sorting and preference checks. */
  maxMinutes: number;
  minCost: number;
  maxCost: number;
  badges: TradeOff[];
  /** Short secondary signal shown on the card, e.g. "High demand". */
  alert?: string;
  summary: string;
  details: OptionDetails;
}

export interface TravelSearch {
  from: string;
  to: string;
  /** When the trip starts; null means leave now. */
  departAt: Date | null;
  /** Coordinates, when the user picked a suggestion. Otherwise the text is geocoded. */
  fromPlace?: Place;
  toPlace?: Place;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

/** A place picked from search suggestions. */
export interface Place extends GeoPoint {
  label: string;
}

/** Real road distance and timings for a trip, from TomTom or an offline estimate. */
export interface TripMetrics {
  distanceKm: number;
  /** Car travel time including live/predicted traffic. */
  driveMinutes: number;
  /** Car travel time on empty roads — compared with driveMinutes to gauge traffic. */
  freeFlowMinutes: number;
  twoWheelerMinutes: number;
  /** 'live' = TomTom routing; 'estimated' = straight-line distance fallback. */
  source: 'live' | 'estimated';
  /** Road geometry for the map. Absent for estimates — draw a straight line. */
  path?: GeoPoint[];
}

/** What the map draws for a search. */
export interface RouteGeometry {
  from: GeoPoint;
  to: GeoPoint;
  /** Road path when known; otherwise just [from, to]. */
  path: GeoPoint[];
  source: TripMetrics['source'];
}

export interface TravelResults {
  routeLabel: string;
  distanceKm: number;
  /** Where distance and timings came from. Absent for curated demo routes. */
  distanceSource?: TripMetrics['source'];
  /** Absent when the places couldn't be located (offline demo data). */
  route?: RouteGeometry;
  conditions: Conditions;
  options: TravelOption[];
}

export interface SavedCommute {
  id: string;
  icon: 'home' | 'school' | 'briefcase' | 'location';
  label: string;
  from: string;
  to: string;
  /** Usual departure, e.g. "8:30 AM" or "Now" — commutes repeat, so no date. */
  time: string;
}

/** Prototype-only switch for demoing empty/error states. */
export type DemoScenario = 'normal' | 'empty' | 'failure';

export interface UserProfile {
  name: string;
  preferredModes: TravelMode[];
  budgetMax: number;
  maxTravelMinutes: number;
}
