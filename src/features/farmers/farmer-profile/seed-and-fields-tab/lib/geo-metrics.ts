import type { LngLat } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-types';

const EARTH_RADIUS_M = 6_371_008.8;
const SQUARE_METERS_PER_ACRE = 4_046.86;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversineDistance([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function polygonPerimeter(ring: LngLat[]) {
  let total = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const start = ring[i];
    const end = ring[i + 1];
    if (!start || !end) continue;
    total += haversineDistance(start, end);
  }

  return total;
}

export function polygonArea(ring: LngLat[]) {
  const origin = ring[0];
  if (!origin) return 0;

  const [originLng, originLat] = origin;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = 111_320 * Math.cos(toRadians(originLat));

  const projected = ring.map(([lng, lat]) => [
    (lng - originLng) * metersPerDegreeLng,
    (lat - originLat) * metersPerDegreeLat,
  ]);

  let area = 0;

  for (let i = 0; i < projected.length - 1; i++) {
    const current = projected[i];
    const next = projected[i + 1];
    if (!current || !next) continue;
    area += current[0] * next[1] - next[0] * current[1];
  }

  return Math.abs(area) / 2;
}

export function acresFromSquareMeters(squareMeters: number) {
  const acres = squareMeters / SQUARE_METERS_PER_ACRE;
  return acres.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function formatArea(squareMeters: number) {
  const hectares = squareMeters / 10_000;
  const acres = squareMeters / SQUARE_METERS_PER_ACRE;

  return {
    primary: `${acres.toFixed(2)} acres`,
    secondary: `${hectares.toFixed(2)} ha`,
  };
}

export function formatPerimeter(meters: number) {
  if (meters >= 1_000) {
    return `${(meters / 1_000).toFixed(2)} km`;
  }

  return `${Math.round(meters)} m`;
}

export function polygonCenter(ring: LngLat[]): [number, number] {
  const points =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;

  const [lngSum, latSum] = points.reduce(
    ([lng, lat], point) => [lng + point[0], lat + point[1]],
    [0, 0],
  );

  return [latSum / points.length, lngSum / points.length];
}
