import { describe, expect, it } from 'vitest';
import {
  formatGeoLocationForForm,
  normalizeGeoLocationForStorage,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/normalize-geo-location';
import {
  parseGeoLocationInput,
  toFieldFeatureCollectionFromTogeojson,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/parse-geo-location';

const SAMPLE_PAIRS = `[31.27493, 75.576341]
[31.274036, 75.576392]
[31.273997, 75.576045]
[31.273978, 75.575211]
[31.274024, 75.573726]
[31.274955, 75.573672]
[31.274942, 75.574556]
[31.274922, 75.575145]
[31.274935, 75.575251]`;

describe('parseGeoLocationInput pair lists', () => {
  it('parses [lat, lng] lines as a closed GeoJSON polygon', () => {
    const parsed = parseGeoLocationInput(SAMPLE_PAIRS);
    expect(parsed.success).toBe(true);
    if (!parsed.success || parsed.value.kind !== 'geojson') {
      throw new Error('expected geojson polygon');
    }

    const ring = parsed.value.ring;
    expect(ring[0]).toEqual([75.576341, 31.27493]);
    expect(ring[ring.length - 1]).toEqual(ring[0]);
    expect(ring).toHaveLength(10);
  });

  it('stores GeoJSON and formats the form back to lat/lng lines', () => {
    const stored = normalizeGeoLocationForStorage(SAMPLE_PAIRS);
    const asJson = JSON.parse(stored) as { type: string };
    expect(asJson.type).toBe('FeatureCollection');
    expect(formatGeoLocationForForm(stored)).toBe(SAMPLE_PAIRS);
  });
});

describe('toFieldFeatureCollectionFromTogeojson', () => {
  it('keeps Polygon features and closes rings', () => {
    const result = toFieldFeatureCollectionFromTogeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Plot A' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [75.576341, 31.27493],
                [75.576392, 31.274036],
                [75.576045, 31.273997],
                [75.576341, 31.27493, 0],
              ],
            ],
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success || result.value.kind !== 'geojson') {
      throw new Error('expected geojson polygon');
    }

    expect(result.value.data.features).toHaveLength(1);
    expect(result.value.properties.name).toBe('Plot A');
    expect(result.value.ring[0]).toEqual([75.576341, 31.27493]);
    expect(result.value.ring[result.value.ring.length - 1]).toEqual(result.value.ring[0]);
  });

  it('flattens MultiPolygon and skips Point features', () => {
    const result = toFieldFeatureCollectionFromTogeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Marker' },
          geometry: { type: 'Point', coordinates: [75.57, 31.27] },
        },
        {
          type: 'Feature',
          properties: { name: 'Multi' },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [75.1, 31.1],
                  [75.2, 31.1],
                  [75.2, 31.2],
                  [75.1, 31.1],
                ],
              ],
              [
                [
                  [75.3, 31.3],
                  [75.4, 31.3],
                  [75.4, 31.4],
                  [75.3, 31.3],
                ],
              ],
            ],
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success || result.value.kind !== 'geojson') {
      throw new Error('expected geojson polygon');
    }

    expect(result.value.data.features).toHaveLength(2);
    expect(result.value.data.features.every((feature) => feature.geometry.type === 'Polygon')).toBe(
      true,
    );
  });

  it('fails when no polygon is present', () => {
    const result = toFieldFeatureCollectionFromTogeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [75.57, 31.27] },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('expected failure');
    }
    expect(result.error).toMatch(/polygon/i);
  });
});
