import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { MapStyleElement } from 'react-native-maps';
import { colors, radius } from '../constants/theme';
import type { GeoPoint, RouteGeometry } from '../types/travel';
import { RouteSketch } from './RouteSketch';

interface Props {
  route: RouteGeometry;
  height: number;
  /** Pan and zoom. Off for previews, so the map doesn't steal list scrolling. */
  interactive?: boolean;
}

const toLatLng = (p: GeoPoint) => ({ latitude: p.lat, longitude: p.lon });

/** Low-saturation Google map (Android) matching the sage palette. iOS uses Apple's muted style. */
const CALM_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#EEF3F1' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7C8F8A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F7FAF9' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E2ECE8' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D6E6EF' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#E5EFE9' }] },
];

const EDGE_PADDING = { top: 48, right: 48, bottom: 48, left: 48 };

/**
 * Google Maps on Android needs an API key in installed builds (Expo Go ships
 * its own). Until one is configured via the react-native-maps config plugin
 * (androidGoogleMapsApiKey in app.json), installed Android builds draw a
 * route sketch instead — a MapView without a key crashes the app.
 */
const NATIVE_MAP_AVAILABLE =
  Platform.OS !== 'android' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function RouteMap(props: Props) {
  return NATIVE_MAP_AVAILABLE ? <NativeRouteMap {...props} /> : <RouteSketch route={props.route} height={props.height} />;
}

function NativeRouteMap({ route, height, interactive = false }: Props) {
  const mapRef = useRef<MapView>(null);
  const path = route.path.map(toLatLng);

  // Rough starting region; onMapReady then fits the whole route precisely.
  const lats = route.path.map((p) => p.lat);
  const lons = route.path.map((p) => p.lon);
  const initialRegion = {
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
    latitudeDelta: Math.max(0.02, (Math.max(...lats) - Math.min(...lats)) * 1.6),
    longitudeDelta: Math.max(0.02, (Math.max(...lons) - Math.min(...lons)) * 1.6),
  };

  return (
    <View style={[styles.frame, { height }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onMapReady={() => mapRef.current?.fitToCoordinates(path, { edgePadding: EDGE_PADDING, animated: false })}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        customMapStyle={CALM_MAP_STYLE}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
        accessibilityLabel="Map of the route"
      >
        <Polyline
          coordinates={path}
          strokeColor={colors.primary}
          strokeWidth={4}
          // A dashed line signals a straight-line estimate, not the real road.
          lineDashPattern={route.source === 'estimated' ? [8, 8] : undefined}
        />
        <Marker coordinate={toLatLng(route.from)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.originDot} />
        </Marker>
        <Marker coordinate={toLatLng(route.to)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.destDot} />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  // Same shapes as the From/To markers in TravelInput.
  originDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  destDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.primary,
  },
});
