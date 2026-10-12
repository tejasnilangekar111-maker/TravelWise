import type { GeoPoint } from '../types/travel';

/**
 * Pune Metro lines and stations, in running order, from OpenStreetMap
 * (route relations tagged network=Pune Metro, fetched Oct 2026; © OpenStreetMap
 * contributors, ODbL). Update this file when new stations open.
 */

export interface MetroStation extends GeoPoint {
  name: string;
}

export interface MetroLine {
  name: string;
  stations: MetroStation[];
}

/** Where the two lines meet; both lines have a "District Court" station. */
export const INTERCHANGE = 'District Court';

export const METRO_LINES: MetroLine[] = [
  {
    name: 'Aqua Line',
    stations: [
      { name: 'Ramwadi', lat: 18.55673, lon: 73.90812 },
      { name: 'Kalyani Nagar', lat: 18.54445, lon: 73.90571 },
      { name: 'Yerwada', lat: 18.54528, lon: 73.88662 },
      { name: 'Bund Garden', lat: 18.54058, lon: 73.88345 },
      { name: 'Ruby Hall Clinic', lat: 18.53271, lon: 73.87776 },
      { name: 'Pune Railway Station', lat: 18.52972, lon: 73.8726 },
      { name: 'Mangalwar Peth', lat: 18.53005, lon: 73.86506 },
      { name: 'District Court', lat: 18.52641, lon: 73.85756 },
      { name: 'PMC Bhavan', lat: 18.5225, lon: 73.85282 },
      { name: 'Chhatrapati Sambhaji Udyan', lat: 18.51966, lon: 73.84697 },
      { name: 'Deccan Gymkhana', lat: 18.51643, lon: 73.84446 },
      { name: 'Garware College', lat: 18.51197, lon: 73.83806 },
      { name: 'SNDT College', lat: 18.50734, lon: 73.82879 },
      { name: 'Paud Phata', lat: 18.50888, lon: 73.82213 },
      { name: 'Anandnagar', lat: 18.50955, lon: 73.81408 },
      { name: 'Vanaz', lat: 18.50717, lon: 73.80523 },
    ],
  },
  {
    name: 'Purple Line',
    stations: [
      { name: 'Swargate', lat: 18.49975, lon: 73.85741 },
      { name: 'Mahatma Phule Mandai', lat: 18.5129, lon: 73.85695 },
      { name: 'Kasba Peth', lat: 18.52142, lon: 73.85956 },
      { name: 'District Court', lat: 18.52673, lon: 73.85689 },
      { name: 'Shivaji Nagar', lat: 18.53215, lon: 73.8496 },
      { name: 'Khadki', lat: 18.56225, lon: 73.84206 },
      { name: 'Bopodi', lat: 18.57014, lon: 73.8379 },
      { name: 'Dapodi', lat: 18.58373, lon: 73.83375 },
      { name: 'Phugewadi', lat: 18.5911, lon: 73.83113 },
      { name: 'Kasarwadi', lat: 18.59961, lon: 73.82724 },
      { name: 'Nashik Phata', lat: 18.60929, lon: 73.82008 },
      { name: 'Sant Tukaram Nagar', lat: 18.61451, lon: 73.81573 },
      { name: 'PCMC Bhavan', lat: 18.6293, lon: 73.80327 },
    ],
  },
];
