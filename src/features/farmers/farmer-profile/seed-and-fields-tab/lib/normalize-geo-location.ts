import {
  formatRingAsLatLngPairList,
  parseGeoLocationInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/parse-geo-location';

export function normalizeGeoLocationForStorage(raw: string) {
  const trimmed = raw.trim();
  const parsed = parseGeoLocationInput(trimmed);

  if (!parsed.success) {
    return trimmed;
  }

  if (parsed.value.kind === 'coordinates') {
    return parsed.value.label;
  }

  return JSON.stringify(parsed.value.data);
}

export function formatGeoLocationForForm(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }

  const parsed = parseGeoLocationInput(trimmed);
  if (parsed.success && parsed.value.kind === 'geojson') {
    return formatRingAsLatLngPairList(parsed.value.ring);
  }

  return trimmed;
}
