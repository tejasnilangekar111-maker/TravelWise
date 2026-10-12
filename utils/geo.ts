import type { GeoPoint, Place } from '../types/travel';
import { shortPlace } from './format';

/**
 * Place search via Photon (https://photon.komoot.io) — free, keyless OpenStreetMap
 * geocoder. Results are biased towards Pune and limited to India.
 */

const PHOTON_URL = 'https://photon.komoot.io/api/';
const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse';
const PUNE: GeoPoint = { lat: 18.5204, lon: 73.8567 };
/** minLon,minLat,maxLon,maxLat — keeps results inside India. */
const INDIA_BBOX = '68.1,6.5,97.4,35.7';

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    district?: string;
    locality?: string;
    city?: string;
    state?: string;
    countrycode?: string;
  };
}

function toPlace(f: PhotonFeature): Place {
  const p = f.properties;
  const parts = [p.name ?? p.street, p.locality ?? p.district, p.city ?? p.state];
  const label = parts.filter((x, i) => x && parts.indexOf(x) === i).join(', ');
  const [lon, lat] = f.geometry.coordinates;
  return { label: label || 'Unnamed place', lat, lon };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const params = new URLSearchParams({
    q,
    limit: '8',
    lang: 'en',
    lat: String(PUNE.lat),
    lon: String(PUNE.lon),
    // Photon's default bias is weak; these rank nearby (Pune) places first.
    zoom: '10',
    location_bias_scale: '0.1',
    bbox: INDIA_BBOX,
  });
  const url = `${PHOTON_URL}?${params}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const json: { features: PhotonFeature[] } = await res.json();
  const places = json.features.filter((f) => f.properties.countrycode === 'IN').map(toPlace);
  // Photon often returns the same label for several OSM objects.
  return places.filter((p, i) => places.findIndex((x) => x.label === p.label) === i).slice(0, 5);
}

/** Best single match for free text the user typed without picking a suggestion. */
export async function geocode(text: string, signal?: AbortSignal): Promise<Place | null> {
  // "Vanaz Metro Station" can match other metro stations, so require the core
  // name to appear, and retry with just that name ("Vanaz") if it doesn't.
  const core = shortPlace(text);
  const matches = (p: Place) => p.label.toLowerCase().includes(core.toLowerCase());
  const places = await searchPlaces(text, signal);
  const hit = places.find(matches);
  if (hit || core === text.trim()) return hit ?? places[0] ?? null;
  const retry = await searchPlaces(core, signal);
  return retry.find(matches) ?? retry[0] ?? places[0] ?? null;
}

/** Nearest named place for a coordinate, e.g. the user's GPS position. */
export async function reverseGeocode(point: GeoPoint, signal?: AbortSignal): Promise<Place | null> {
  const params = new URLSearchParams({ lat: String(point.lat), lon: String(point.lon), lang: 'en', limit: '1' });
  const res = await fetch(`${PHOTON_REVERSE_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
  const json: { features: PhotonFeature[] } = await res.json();
  const feature = json.features[0];
  // Keep the exact GPS coordinates; only borrow the readable label.
  return feature ? { ...toPlace(feature), lat: point.lat, lon: point.lon } : null;
}

/** Great-circle distance in km. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
