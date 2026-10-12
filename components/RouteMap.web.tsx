import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/theme';
import type { RouteGeometry } from '../types/travel';

/**
 * Web fallback — react-native-maps has no web support. Shows a keyless
 * OpenStreetMap embed framed around the trip, with a pin at the destination.
 * (The embed can't draw the route line.)
 */

interface Props {
  route: RouteGeometry;
  height: number;
  interactive?: boolean;
}

export function RouteMap({ route, height }: Props) {
  const lats = route.path.map((p) => p.lat);
  const lons = route.path.map((p) => p.lon);
  const padLat = Math.max(0.01, (Math.max(...lats) - Math.min(...lats)) * 0.2);
  const padLon = Math.max(0.01, (Math.max(...lons) - Math.min(...lons)) * 0.2);
  const bbox = [
    Math.min(...lons) - padLon,
    Math.min(...lats) - padLat,
    Math.max(...lons) + padLon,
    Math.max(...lats) + padLat,
  ].join(',');
  const src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}` +
    `&layer=mapnik&marker=${route.to.lat},${route.to.lon}`;

  return (
    <View style={[styles.frame, { height }]}>
      <iframe
        src={src}
        title="Map of the route"
        style={{ border: 0, width: '100%', height: '100%', filter: 'saturate(0.6)' }}
        loading="lazy"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
});
