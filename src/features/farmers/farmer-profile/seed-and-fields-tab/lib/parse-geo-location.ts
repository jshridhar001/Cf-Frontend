import { kml } from '@tmcw/togeojson';
import type {
  FieldFeatureCollection,
  FieldFeatureProperties,
  FieldPolygonFeature,
  LngLat,
  ParsedGeoLocation,
  ParseGeoLocationResult,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-types';

const LEGACY_COORDS_PATTERN = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;
const LAT_LNG_PAIR_PATTERN = /\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g;
const LAT_LNG_PAIR_LIST_PATTERN = /^(?:\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\]\s*,?\s*)+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isLngLatPair(value: unknown): value is LngLat {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function isPolygonRing(value: unknown): value is LngLat[] {
  return Array.isArray(value) && value.length >= 4 && value.every(isLngLatPair);
}

function isPolygonFeature(value: unknown): value is FieldPolygonFeature {
  if (!isRecord(value) || value.type !== 'Feature') {
    return false;
  }

  const geometry = value.geometry;
  if (!isRecord(geometry) || geometry.type !== 'Polygon') {
    return false;
  }

  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return false;
  }

  return coordinates.every(isPolygonRing);
}

function isFeatureCollection(value: unknown): value is FieldFeatureCollection {
  if (!isRecord(value) || value.type !== 'FeatureCollection') {
    return false;
  }

  if (!Array.isArray(value.features) || value.features.length === 0) {
    return false;
  }

  return value.features.every(isPolygonFeature);
}

function wrapPartialJson(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith('{')) {
    return trimmed;
  }

  if (trimmed.startsWith('"features"') || trimmed.startsWith('features')) {
    return `{${trimmed.startsWith('"') ? '' : '"'}${trimmed}}`;
  }

  return trimmed;
}

/** Survey exports often omit commas between consecutive [lng, lat] pairs. */
function repairGeoJsonText(raw: string) {
  return wrapPartialJson(raw).replace(/\]\s*\[/g, '],[');
}

function closePolygonRing(ring: LngLat[]): LngLat[] {
  if (ring.length < 3) {
    return ring;
  }

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  if (firstLng === lastLng && firstLat === lastLat) {
    return ring;
  }

  return [...ring, ring[0]];
}

function normalizeFeatureCollection(data: FieldFeatureCollection): FieldFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: data.features.map((feature) => ({
      ...feature,
      geometry: {
        type: 'Polygon',
        coordinates: feature.geometry.coordinates.map((ring) => closePolygonRing(ring)),
      },
    })),
  };
}

function parseJson(raw: string): unknown {
  const trimmed = raw.trim();

  try {
    return JSON.parse(wrapPartialJson(trimmed));
  } catch {
    return JSON.parse(repairGeoJsonText(trimmed));
  }
}

function toParsedGeoJson(data: FieldFeatureCollection): ParsedGeoLocation {
  const feature = data.features[0];
  const ring = feature.geometry.coordinates[0];

  return {
    kind: 'geojson',
    data,
    ring,
    properties: feature.properties ?? {},
  };
}

function latLngRingFromClosed(ring: LngLat[]): LngLat[] {
  if (
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
  ) {
    return ring.slice(0, -1);
  }

  return ring;
}

/** Formats a GeoJSON [lng, lat] ring as pasted `[lat, lng]` lines (no closing duplicate). */
export function formatRingAsLatLngPairList(ring: LngLat[]): string {
  return latLngRingFromClosed(ring)
    .map(([lng, lat]) => `[${lat}, ${lng}]`)
    .join('\n');
}

function parseLatLngPairList(raw: string): ParseGeoLocationResult | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('[')) {
    return null;
  }

  if (!LAT_LNG_PAIR_LIST_PATTERN.test(trimmed)) {
    return {
      success: false,
      error: 'Paste [lat, lng] pairs, one per line.',
    };
  }

  const ring: LngLat[] = [];
  LAT_LNG_PAIR_PATTERN.lastIndex = 0;
  for (const match of trimmed.matchAll(LAT_LNG_PAIR_PATTERN)) {
    const lat = Number.parseFloat(match[1]);
    const lng = Number.parseFloat(match[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return {
        success: false,
        error: 'Paste [lat, lng] pairs, one per line.',
      };
    }
    ring.push([lng, lat]);
  }

  if (ring.length < 3) {
    return {
      success: false,
      error: 'Paste at least 3 [lat, lng] pairs to form a plot boundary.',
    };
  }

  const collection: FieldFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [closePolygonRing(ring)],
        },
        properties: {},
      },
    ],
  };

  return {
    success: true,
    value: toParsedGeoJson(normalizeFeatureCollection(collection)),
  };
}

function parseLegacyCoordinates(raw: string): ParseGeoLocationResult | null {
  const match = raw.trim().match(LEGACY_COORDS_PATTERN);
  if (!match) {
    return null;
  }

  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    success: true,
    value: {
      kind: 'coordinates',
      lat,
      lng,
      label: `${lat}, ${lng}`,
    },
  };
}

export function parseGeoLocationInput(raw: string): ParseGeoLocationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { success: false, error: 'Geo location is required' };
  }

  const pairList = parseLatLngPairList(trimmed);
  if (pairList) {
    return pairList;
  }

  const legacy = parseLegacyCoordinates(trimmed);
  if (legacy) {
    return legacy;
  }

  try {
    const parsed = parseJson(trimmed);
    if (!isFeatureCollection(parsed)) {
      return {
        success: false,
        error: 'Paste [lat, lng] pairs, one per line.',
      };
    }

    const normalized = normalizeFeatureCollection(parsed);

    return {
      success: true,
      value: toParsedGeoJson(normalized),
    };
  } catch {
    return {
      success: false,
      error: 'Paste [lat, lng] pairs, one per line.',
    };
  }
}

export function parseStoredGeoLocation(
  raw: string,
): { success: true; value: ParsedGeoLocation } | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const result = parseGeoLocationInput(trimmed);
  return result.success ? result : null;
}

export function getGeoJsonFromStored(raw: string): FieldFeatureCollection | null {
  const parsed = parseStoredGeoLocation(raw);
  if (parsed?.value.kind !== 'geojson') {
    return null;
  }

  return parsed.value.data;
}

function toLngLat(value: unknown): LngLat | null {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }

  const lng = typeof value[0] === 'number' ? value[0] : Number.NaN;
  const lat = typeof value[1] === 'number' ? value[1] : Number.NaN;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return [lng, lat];
}

function toPolygonRings(coordinates: unknown): LngLat[][] | null {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return null;
  }

  const rings: LngLat[][] = [];
  for (const rawRing of coordinates) {
    if (!Array.isArray(rawRing) || rawRing.length < 3) {
      return null;
    }

    const ring: LngLat[] = [];
    for (const position of rawRing) {
      const pair = toLngLat(position);
      if (!pair) {
        return null;
      }
      ring.push(pair);
    }

    rings.push(closePolygonRing(ring));
  }

  return rings;
}

function featureProperties(value: unknown): FieldFeatureProperties {
  if (!isRecord(value)) {
    return {};
  }

  const properties: FieldFeatureProperties = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' || typeof entry === 'number' || entry === undefined) {
      properties[key] = entry;
    } else if (entry !== null) {
      properties[key] = String(entry);
    }
  }

  return properties;
}

function polygonFeaturesFromGeometry(
  geometry: unknown,
  properties: FieldFeatureProperties,
): FieldPolygonFeature[] {
  if (!isRecord(geometry) || typeof geometry.type !== 'string') {
    return [];
  }

  if (geometry.type === 'Polygon') {
    const rings = toPolygonRings(geometry.coordinates);
    if (!rings) {
      return [];
    }

    return [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: rings },
        properties,
      },
    ];
  }

  if (geometry.type === 'MultiPolygon') {
    if (!Array.isArray(geometry.coordinates)) {
      return [];
    }

    const features: FieldPolygonFeature[] = [];
    for (const polygonCoords of geometry.coordinates) {
      const rings = toPolygonRings(polygonCoords);
      if (!rings) {
        continue;
      }
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: rings },
        properties,
      });
    }
    return features;
  }

  return [];
}

/**
 * Converts a togeojson-style FeatureCollection into our Polygon-only
 * FieldFeatureCollection. Skips Point/LineString; flattens MultiPolygon.
 */
export function toFieldFeatureCollectionFromTogeojson(value: unknown): ParseGeoLocationResult {
  if (!isRecord(value) || value.type !== 'FeatureCollection' || !Array.isArray(value.features)) {
    return {
      success: false,
      error: 'KML did not contain a valid FeatureCollection.',
    };
  }

  const features: FieldPolygonFeature[] = [];

  for (const feature of value.features) {
    if (!isRecord(feature) || feature.type !== 'Feature') {
      continue;
    }

    const properties = featureProperties(feature.properties);
    features.push(...polygonFeaturesFromGeometry(feature.geometry, properties));
  }

  if (features.length === 0) {
    return {
      success: false,
      error: 'KML must include at least one polygon boundary.',
    };
  }

  const collection = normalizeFeatureCollection({
    type: 'FeatureCollection',
    features,
  });

  return {
    success: true,
    value: toParsedGeoJson(collection),
  };
}

export function parseKmlText(xml: string): ParseGeoLocationResult {
  const trimmed = xml.trim();
  if (!trimmed) {
    return { success: false, error: 'KML file is empty.' };
  }

  if (typeof DOMParser === 'undefined') {
    return {
      success: false,
      error: 'KML parsing is only available in the browser.',
    };
  }

  const doc = new DOMParser().parseFromString(trimmed, 'text/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    return { success: false, error: 'Invalid KML XML.' };
  }

  try {
    return toFieldFeatureCollectionFromTogeojson(kml(doc));
  } catch {
    return { success: false, error: 'Failed to convert KML to GeoJSON.' };
  }
}
