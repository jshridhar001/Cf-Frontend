export type LngLat = [number, number];

export type FieldFeatureProperties = Record<string, string | number | undefined>;

export type FieldPolygonFeature = {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: LngLat[][];
  };
  properties?: FieldFeatureProperties;
};

export type FieldFeatureCollection = {
  type: 'FeatureCollection';
  features: FieldPolygonFeature[];
};

export type ParsedGeoLocation =
  | {
      kind: 'geojson';
      data: FieldFeatureCollection;
      ring: LngLat[];
      properties: FieldFeatureProperties;
    }
  | {
      kind: 'coordinates';
      lat: number;
      lng: number;
      label: string;
    };

export type ParseGeoLocationResult =
  | { success: true; value: ParsedGeoLocation }
  | { success: false; error: string };
