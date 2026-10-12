import * as Location from 'expo-location';
import type { Place } from '../types/travel';
import { reverseGeocode } from './geo';

/**
 * The user's current position as a Place, for the From field. Asks for
 * foreground permission on first use; never runs in the background.
 */

/** getCurrentPositionAsync can hang indoors or with GPS off; give up after this. */
const FIX_TIMEOUT_MS = 15_000;
/** A recent cached fix is good enough for a trip's starting point and is instant. */
const LAST_KNOWN = { maxAge: 2 * 60 * 1000, requiredAccuracy: 200 };

/** Errors whose message is safe to show the user as-is. */
export class LocationError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new LocationError('Finding your location took too long. Try again or type it in.')), ms),
    ),
  ]);
}

export async function getCurrentPlace(): Promise<Place> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationError('Location access is off. Allow it in settings, or type your starting point.');
  }

  const position =
    (await Location.getLastKnownPositionAsync(LAST_KNOWN).catch(() => null)) ??
    (await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      FIX_TIMEOUT_MS,
    ));
  const point = { lat: position.coords.latitude, lon: position.coords.longitude };

  // The label is a nicety; the coordinates alone are enough to route from.
  const named = await reverseGeocode(point).catch(() => null);
  return named ?? { label: 'Current location', ...point };
}
