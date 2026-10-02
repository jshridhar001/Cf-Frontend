import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type {
  AnalyticsRequisitionRow,
  StationAnalytics,
} from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { formatAcres } from '@/features/seed-requisition/analytics/lib/format';
import { useIsMobile } from '@/hooks/use-mobile';

function groupRequisitions(rows: AnalyticsRequisitionRow[]) {
  const groups = new Map<
    string,
    { key: string; label: string; rows: AnalyticsRequisitionRow[]; acres: number }
  >();
  for (const row of rows) {
    const group = groups.get(row.familyKey) ?? {
      key: row.familyKey,
      label: row.familyLabel,
      rows: [],
      acres: 0,
    };
    group.rows.push(row);
    group.acres += row.acres;
    groups.set(row.familyKey, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      rows: [...group.rows].sort(
        (a, b) => b.acres - a.acres || a.shortName.localeCompare(b.shortName),
      ),
    }))
    .sort((a, b) => b.acres - a.acres || a.label.localeCompare(b.label));
}

function RequisitionList({ station }: { station: StationAnalytics }) {
  const groups = groupRequisitions(station.requisitions);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-medium">{group.label}</h3>
            <p className="text-sm text-muted-foreground tabular-nums">
              {formatAcres(group.acres)} acres
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {group.rows.map((row) => (
              <li key={row.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-sm">
                <span className="font-medium">{row.shortName}</span>
                <span className="tabular-nums">{formatAcres(row.acres)}</span>
                <span className="text-muted-foreground">
                  {row.accountNumber} · {row.varietyName}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function StationRequisitionsPanel({
  station,
  onOpenChange,
}: {
  station: StationAnalytics | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const open = station !== null;
  const title = station?.name ?? 'Station';
  const description = station
    ? `${formatAcres(station.acres)} acres · ${station.farmers} farmers`
    : '';

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        direction="bottom"
        shouldScaleBackground={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {station ? <RequisitionList station={station} /> : null}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {station ? <RequisitionList station={station} /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
