import { type ControlPosition, latLngBounds } from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Polygon, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngTuple } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import { cn } from '@/lib/utils';

const SATELLITE_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const PLOT_PATH = {
  color: '#f5c518',
  weight: 3,
  fillColor: '#f5c518',
  fillOpacity: 0.2,
};

export function FieldPlotMap({
  boundary,
  interactive = false,
  className,
  label,
  zoomControlPosition = 'topleft',
}: {
  boundary: LatLngTuple[];
  interactive?: boolean;
  className?: string;
  label: string;
  zoomControlPosition?: ControlPosition;
}) {
  const center = boundary[0];
  if (!center) return null;
  const useDefaultZoom = zoomControlPosition === 'topleft';

  return (
    <div
      className={cn(
        'isolate overflow-hidden rounded-md bg-muted',
        interactive ? 'h-80 w-full' : 'h-[72px] w-28',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <MapContainer
        center={center}
        zoom={16}
        zoomControl={interactive && useDefaultZoom}
        attributionControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        touchZoom={interactive}
        className={cn('h-full w-full', !interactive && 'pointer-events-none')}
      >
        <TileLayer url={SATELLITE_TILES} attribution="Tiles &copy; Esri" maxZoom={19} />
        <Polygon positions={boundary} {...PLOT_PATH} />
        {interactive && !useDefaultZoom ? <ZoomControl position={zoomControlPosition} /> : null}
        <FitBoundary boundary={boundary} interactive={interactive} />
      </MapContainer>
    </div>
  );
}

function FitBoundary({ boundary, interactive }: { boundary: LatLngTuple[]; interactive: boolean }) {
  const map = useMap();

  useEffect(() => {
    const bounds = latLngBounds(boundary);
    const syncBounds = () => {
      map.invalidateSize();
      if (!bounds.isValid()) return;
      map.fitBounds(bounds, {
        padding: interactive ? [24, 24] : [8, 8],
        maxZoom: 18,
        animate: false,
      });
    };

    syncBounds();
    const frame = requestAnimationFrame(syncBounds);
    const timer = window.setTimeout(syncBounds, 200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [boundary, interactive, map]);

  return null;
}
