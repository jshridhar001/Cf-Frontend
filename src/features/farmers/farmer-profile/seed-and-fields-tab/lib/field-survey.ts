import {
  formatArea,
  formatPerimeter,
  polygonArea,
  polygonCenter,
  polygonPerimeter,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-metrics';
import type {
  FieldFeatureCollection,
  LngLat,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-types';
import {
  getGeoJsonFromStored,
  parseStoredGeoLocation,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/parse-geo-location';
import type { LatLngTuple } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';

export type FieldSurvey = {
  data: FieldFeatureCollection;
  areaSquareMeters: number;
  perimeterMeters: number;
  center: [number, number];
  formattedArea: ReturnType<typeof formatArea>;
  formattedPerimeter: string;
  boundary: LatLngTuple[];
};

function openRing(ring: LngLat[]): LngLat[] {
  if (
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
  ) {
    return ring.slice(0, -1);
  }

  return ring;
}

export function leafletBoundaryFromRing(ring: LngLat[]): LatLngTuple[] {
  return openRing(ring).map(([lng, lat]) => [lat, lng]);
}

export function getFieldSurvey(geoLocation: string): FieldSurvey | null {
  const parsed = parseStoredGeoLocation(geoLocation);
  if (parsed?.value.kind !== 'geojson') {
    return null;
  }

  const { data, ring } = parsed.value;
  const areaSquareMeters = polygonArea(ring);
  const perimeterMeters = polygonPerimeter(ring);

  return {
    data,
    areaSquareMeters,
    perimeterMeters,
    center: polygonCenter(ring),
    formattedArea: formatArea(areaSquareMeters),
    formattedPerimeter: formatPerimeter(perimeterMeters),
    boundary: leafletBoundaryFromRing(ring),
  };
}

export function getFieldSurveyFromInput(geoLocation: string) {
  const data = getGeoJsonFromStored(geoLocation);
  if (!data) {
    return null;
  }

  return getFieldSurvey(JSON.stringify(data));
}
