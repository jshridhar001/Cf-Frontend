import { MapPin } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import type { Station } from '@/features/master/types';
import { cn } from '@/lib/utils';

type StationsListProps = {
  stations: Station[];
  selectedStationId: string;
  onSelect: (id: string) => void;
  onEdit: (station: Station) => void;
  onDelete: (station: Station) => void;
};

function stationSubtitle(station: Station) {
  const localityCount = station.localities.length;
  const localityLabel = `${localityCount} ${localityCount === 1 ? 'locality' : 'localities'}`;
  const location = [station.city, station.state].filter(Boolean).join(', ');
  return location ? `${localityLabel} · ${location}` : localityLabel;
}

export function StationsList({
  stations,
  selectedStationId,
  onSelect,
  onEdit,
  onDelete,
}: StationsListProps) {
  if (stations.length === 0) {
    return (
      <Empty className="rounded-none border-0 py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPin />
          </EmptyMedia>
          <EmptyTitle>No stations</EmptyTitle>
          <EmptyDescription>Create a station to get started.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <ul className="hidden divide-y overflow-y-auto lg:block">
        {stations.map((station) => {
          const isSelected = station.id === selectedStationId;

          return (
            <li key={station.id}>
              <div
                className={cn(
                  'group flex items-center gap-2 px-3 py-2.5 transition-colors',
                  isSelected ? 'bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(station.id)}
                  className="min-w-0 flex-1 rounded-lg px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <span className="block truncate text-sm font-semibold tracking-wide">
                    {station.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {stationSubtitle(station)}
                  </span>
                </button>
                <MasterRowActions
                  onEdit={() => onEdit(station)}
                  onDelete={() => onDelete(station)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <ItemGroup className="lg:hidden">
        {stations.map((station) => {
          const isSelected = station.id === selectedStationId;
          return (
            <Item
              key={station.id}
              variant="outline"
              size="sm"
              className={cn('items-start', isSelected && 'border-foreground/20 bg-muted')}
            >
              <ItemHeader className="gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(station.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <ItemContent className="min-w-0 pr-1">
                    <ItemTitle>{station.name}</ItemTitle>
                    <ItemDescription>{stationSubtitle(station)}</ItemDescription>
                  </ItemContent>
                </button>
                <ItemActions className="shrink-0 self-start">
                  <MasterRowActions
                    onEdit={() => onEdit(station)}
                    onDelete={() => onDelete(station)}
                  />
                </ItemActions>
              </ItemHeader>
            </Item>
          );
        })}
      </ItemGroup>
    </>
  );
}
