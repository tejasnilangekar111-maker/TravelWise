import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../constants/theme';
import type { GeoPoint, RouteGeometry } from '../types/travel';

interface Props {
  route: RouteGeometry;
  height: number;
}

const PAD = 32;
/** Room kept clear at the bottom for the caption. */
const CAPTION_SPACE = 16;

/** Dots along the route, scaled and centred in the frame — the shape of the trip without map tiles. */
export function RouteSketch({ route, height }: Props) {
  const [width, setWidth] = useState(0);

  // Longitude degrees shrink with latitude; scale them so the shape isn't stretched.
  const kx = Math.cos((route.from.lat * Math.PI) / 180);
  const xs = route.path.map((p) => p.lon * kx);
  const ys = route.path.map((p) => p.lat);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const boxW = Math.max(1, width - PAD * 2);
  const boxH = Math.max(1, height - PAD * 2 - CAPTION_SPACE);
  // One scale for both axes keeps the real shape; the route is centred in the box.
  const scale = Math.min(boxW / Math.max(maxX - minX, 1e-6), boxH / Math.max(maxY - minY, 1e-6));
  const offX = PAD + (boxW - (maxX - minX) * scale) / 2;
  const offY = PAD + (boxH - (maxY - minY) * scale) / 2;
  const at = (p: GeoPoint) => ({ left: offX + (p.lon * kx - minX) * scale, top: offY + (maxY - p.lat) * scale });

  return (
    <View
      style={[styles.frame, { height }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel="Sketch of the route"
    >
      {[0.25, 0.5, 0.75].map((f) => (
        <View key={`h${f}`} style={[styles.gridLine, { top: `${f * 100}%`, left: 0, right: 0, height: 1 }]} />
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <View key={`v${f}`} style={[styles.gridLine, { left: `${f * 100}%`, top: 0, bottom: 0, width: 1 }]} />
      ))}

      {width > 0 && (
        <>
          {sample(route.path, 48).map((p, i) => (
            // A dotted (gappy) line marks a straight-line estimate, like the dashed map line.
            <View
              key={i}
              style={[styles.pathDot, at(p), route.source === 'estimated' && i % 2 === 1 && styles.hidden]}
            />
          ))}
          <View style={[styles.endpoint, styles.originDot, at(route.from)]} />
          <View style={[styles.endpoint, styles.destDot, at(route.to)]} />
        </>
      )}

      <Text style={styles.caption}>Route sketch · map coming soon</Text>
    </View>
  );
}

/**
 * n evenly spaced points along a path, both ends included. A two-point path
 * (straight-line estimate) is interpolated so it still draws as a line.
 */
function sample(points: GeoPoint[], n: number): GeoPoint[] {
  if (points.length <= 2) {
    const a = points[0];
    const b = points[points.length - 1];
    return Array.from({ length: n }, (_, i) => ({
      lat: a.lat + ((b.lat - a.lat) * i) / (n - 1),
      lon: a.lon + ((b.lon - a.lon) * i) / (n - 1),
    }));
  }
  const step = (points.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => points[Math.round(i * step)]);
}

const styles = StyleSheet.create({
  frame: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#EEF3F1' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(124, 143, 138, 0.12)' },
  pathDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    marginLeft: -2.5,
    marginTop: -2.5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  hidden: { opacity: 0 },
  endpoint: { position: 'absolute', width: 16, height: 16, marginLeft: -8, marginTop: -8 },
  // Same shapes as the From/To markers in TravelInput and RouteMap.
  originDot: { borderRadius: 8, borderWidth: 4, borderColor: colors.accent, backgroundColor: colors.surface },
  destDot: { borderRadius: 4, borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.primary },
  caption: { ...font.caption, position: 'absolute', left: spacing.md, bottom: spacing.sm, color: colors.textMuted },
});
