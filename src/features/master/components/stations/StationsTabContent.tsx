import { MapPin, PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useStations } from '@/features/master/api/use-stations';
import type { Locality, Station } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateLocalityDrawer } from './create-locality-drawer';
import { CreateStationDrawer } from './create-station-drawer';
import { DeleteAllStationsDialog } from './delete-all-stations-dialog';
import { DeleteLocalityDialog } from './delete-locality-dialog';
import { DeleteStationDialog } from './delete-station-dialog';
import { EditLocalityDrawer } from './edit-locality-drawer';
import { EditStationDrawer } from './edit-station-drawer';
import { LocalitiesTable } from './localities-table';
import { columns as localityColumns } from './locality-table-column';
import { StationsList } from './stations-list';

interface StationsTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function StationsTabContent({ createOpen, onCreateOpenChange }: StationsTabContentProps) {
  const { data: stations, isPending, isError, error } = useStations();
  const [selectedStationId, setSelectedStationId] = useState('');
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deletingStation, setDeletingStation] = useState<Station | null>(null);
  const [isAddLocalityOpen, setIsAddLocalityOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [deletingLocality, setDeletingLocality] = useState<Locality | null>(null);

  const stationList = stations ?? [];
  const canDeleteAll = stationList.length > 0;

  useEffect(() => {
    if (stationList.length === 0) {
      setSelectedStationId('');
      return;
    }

    if (!stationList.some((station) => station.id === selectedStationId)) {
      setSelectedStationId(stationList[0].id);
    }
  }, [stationList, selectedStationId]);

  const selectedStation = useMemo(
    () => stationList.find((station) => station.id === selectedStationId) ?? null,
    [stationList, selectedStationId],
  );

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Stations</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage stations and the localities within each station.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all stations"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add station"
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && stations === undefined ? (
          <p className="text-sm text-muted-foreground">Loading stations…</p>
        ) : null}

        {isError && stations === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {stations !== undefined ? (
          <div className="flex flex-col gap-6 lg:grid lg:min-h-[32rem] lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border">
            <div className="flex min-w-0 flex-col lg:border-r">
              <div className="mb-3 flex items-center justify-between gap-2 lg:mb-0 lg:border-b lg:px-4 lg:py-3">
                <h3 className="text-sm font-semibold">Stations</h3>
                <div className="hidden items-center gap-2 md:flex">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={!canDeleteAll}
                    onClick={() => setDeleteAllOpen(true)}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Delete All
                  </Button>
                  <Button type="button" size="sm" onClick={() => onCreateOpenChange(true)}>
                    <PlusIcon data-icon="inline-start" />
                    Add Station
                  </Button>
                </div>
              </div>
              <StationsList
                stations={stations}
                selectedStationId={selectedStationId}
                onSelect={setSelectedStationId}
                onEdit={setEditingStation}
                onDelete={setDeletingStation}
              />
            </div>

            <div className="min-w-0 lg:p-5">
              {selectedStation ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold tracking-tight">
                        Localities — {selectedStation.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {selectedStation.localities.length}{' '}
                        {selectedStation.localities.length === 1 ? 'locality' : 'localities'} in
                        this station
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      className="min-h-11 min-w-11 md:hidden"
                      aria-label="Add locality"
                      onClick={() => setIsAddLocalityOpen(true)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>

                  <LocalitiesTable
                    columns={localityColumns}
                    data={selectedStation.localities}
                    onAdd={() => setIsAddLocalityOpen(true)}
                    onEdit={setEditingLocality}
                    onDelete={setDeletingLocality}
                  />
                </div>
              ) : (
                <Empty className="border-0 py-16">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPin />
                    </EmptyMedia>
                    <EmptyTitle>No station selected</EmptyTitle>
                    <EmptyDescription>
                      Select a station from the list to view its localities.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        ) : null}
      </PageCardContent>

      <CreateStationDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
      <EditStationDrawer
        station={editingStation}
        open={editingStation !== null}
        onOpenChange={(open) => {
          if (!open) setEditingStation(null);
        }}
      />
      <CreateLocalityDrawer
        open={isAddLocalityOpen && selectedStation !== null}
        onOpenChange={setIsAddLocalityOpen}
        stationId={selectedStation?.id ?? null}
        stationName={selectedStation?.name}
      />
      <EditLocalityDrawer
        locality={editingLocality}
        open={editingLocality !== null}
        onOpenChange={(open) => {
          if (!open) setEditingLocality(null);
        }}
      />
      <DeleteStationDialog
        station={deletingStation}
        open={deletingStation !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingStation(null);
        }}
      />
      <DeleteAllStationsDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={stationList.length}
      />
      <DeleteLocalityDialog
        locality={deletingLocality}
        open={deletingLocality !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingLocality(null);
        }}
      />
    </PageCard>
  );
}
