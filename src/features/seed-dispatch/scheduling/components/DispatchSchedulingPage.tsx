import { SearchIcon, TruckIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { DatePickerInput, parseDateOnlyString } from '@/components/ui/date-picker';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formatAwaitingQuantity,
  localCalendarDay,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import { PendingDeliveryGroups } from '@/features/seed-dispatch/scheduling/components/pending-delivery-groups';
import {
  buildPendingDeliveryLines,
  filterPendingLines,
  groupPendingDeliveriesByDate,
  type PendingDeliveryLine,
  summarizePendingLines,
} from '@/features/seed-dispatch/scheduling/lib/pending-deliveries';
import { useSeedRequisitions } from '@/features/seed-requisition/overview/api/use-seed-requisitions';
import { ApproveRequisitionDialog } from '@/features/seed-requisition/overview/components/approve-requisition-dialog';
import type {
  SeedRequisition,
  SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

const ALL = 'all';

export function DispatchSchedulingPage() {
  const { data: requisitions, isPending, isError, error } = useSeedRequisitions();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [varietyId, setVarietyId] = useState(ALL);
  const [station, setStation] = useState(ALL);
  const [approving, setApproving] = useState<{
    requisition: SeedRequisition;
    delivery: SeedRequisitionDelivery;
  } | null>(null);

  const lines = useMemo(() => buildPendingDeliveryLines(requisitions ?? []), [requisitions]);
  const summary = useMemo(() => summarizePendingLines(lines), [lines]);
  const visibleLines = useMemo(
    () =>
      filterPendingLines(lines, {
        query,
        date,
        varietyId: varietyId === ALL ? '' : varietyId,
        station: station === ALL ? '' : station,
      }),
    [lines, query, date, varietyId, station],
  );
  const groups = useMemo(() => groupPendingDeliveriesByDate(visibleLines), [visibleLines]);

  const varieties = useMemo(() => {
    const byId = new Map<string, string>();
    for (const line of lines) {
      if (line.varietyId) byId.set(line.varietyId, line.varietyName || 'Unknown variety');
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [lines]);

  const stations = useMemo(() => {
    return [...new Set(lines.map((line) => line.stationName).filter(Boolean))].sort((left, right) =>
      left.localeCompare(right),
    );
  }, [lines]);

  const filtersActive = query.trim() !== '' || date !== '' || varietyId !== ALL || station !== ALL;

  function approveLine(line: PendingDeliveryLine) {
    if (!line.deliveryId || !requisitions) return;
    const requisition = requisitions.find((item) => item.id === line.requisitionId);
    const delivery = requisition?.requestedDeliveries.find((item) => item.id === line.deliveryId);
    if (!requisition || !delivery) return;
    setApproving({ requisition, delivery });
  }

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Dispatch scheduling</CardTitle>
        <CardDescription className="hidden sm:block">
          Pending delivery requests, grouped by the date farmers asked for. Approve a delivery when
          it is ready to go out.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent className="flex flex-col gap-4">
        {isPending && requisitions === undefined ? <DataTableSkeleton /> : null}

        {isError && requisitions === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {requisitions !== undefined && lines.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TruckIcon />
              </EmptyMedia>
              <EmptyTitle>No pending deliveries</EmptyTitle>
              <EmptyDescription>
                Approved and rejected requests stay on Overview. New pending delivery dates will
                show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {requisitions !== undefined && lines.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryStat
                label="Pending requests"
                value={formatAwaitingQuantity(summary.count, 0)}
              />
              <SummaryStat label="Bags" value={formatAwaitingQuantity(summary.bags, 0)} />
              <SummaryStat label="Acres" value={formatAwaitingQuantity(summary.acres)} />
              <SummaryStat label="Dates" value={formatAwaitingQuantity(summary.dateCount, 0)} />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <InputGroup className="w-full sm:max-w-xs">
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  placeholder="Farmer, station, variety"
                  aria-label="Search pending deliveries"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </InputGroup>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <DatePickerInput
                  id="scheduling-date"
                  className="w-full sm:w-52"
                  placeholder="All dates"
                  value={date ? parseDateOnlyString(date) : undefined}
                  onChange={(next) => setDate(next ? localCalendarDay(next) : '')}
                />
              </div>
              <Select
                value={varietyId}
                onValueChange={(value) => {
                  if (value) setVarietyId(value);
                }}
              >
                <SelectTrigger className="w-full sm:w-48" aria-label="Variety">
                  <SelectValue placeholder="All varieties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All varieties</SelectItem>
                  {varieties.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={station}
                onValueChange={(value) => {
                  if (value) setStation(value);
                }}
              >
                <SelectTrigger className="w-full sm:w-48" aria-label="Station">
                  <SelectValue placeholder="All stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All stations</SelectItem>
                  {stations.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filtersActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 sm:min-h-8"
                  onClick={() => {
                    setQuery('');
                    setDate('');
                    setVarietyId(ALL);
                    setStation(ALL);
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>

            <PendingDeliveryGroups
              groups={groups}
              filteredEmpty={visibleLines.length === 0}
              onApprove={approveLine}
            />
          </>
        ) : null}
      </PageCardContent>
      <ApproveRequisitionDialog
        requisition={approving?.requisition ?? null}
        delivery={approving?.delivery ?? null}
        open={approving !== null}
        onOpenChange={(open) => {
          if (!open) setApproving(null);
        }}
      />
    </PageCard>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
