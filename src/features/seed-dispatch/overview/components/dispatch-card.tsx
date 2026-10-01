import { CalendarDays, MapPin, Package, Phone, Truck, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DispatchActions } from '@/features/seed-dispatch/overview/components/dispatch-actions';
import {
  getDeliveredOn,
  getFacilitySummary,
  getFarmersReceived,
} from '@/features/seed-dispatch/overview/lib/derived';
import { formatSummaryCount } from '@/features/seed-dispatch/overview/lib/summary';
import {
  formatDispatchDate,
  formatNetWeight,
  formatSeedDispatchStatus,
  type SeedDispatch,
} from '@/features/seed-dispatch/overview/types';
import { cn } from '@/lib/utils';

function DispatchRow({
  icon: Icon,
  value,
  muted = false,
}: {
  icon: typeof Package;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <p
        className={cn(
          'truncate text-sm',
          muted ? 'text-muted-foreground' : 'font-medium text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function statusBadgeClass(status: SeedDispatch['status']) {
  if (status === 'DELIVERED') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'IN_TRANSIT') {
    return 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-400';
  }
  if (status === 'NULL') {
    return 'border-border bg-muted text-muted-foreground';
  }
  return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400';
}

export function DispatchCard({ dispatch }: { dispatch: SeedDispatch }) {
  const facility = getFacilitySummary(dispatch);
  const farmers = getFarmersReceived(dispatch);
  const deliveredOn = getDeliveredOn(dispatch);
  const truck = dispatch.truckNumber?.trim();

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="pr-2 font-heading text-base font-semibold tracking-tight">
          {dispatch.toLocation}
        </CardTitle>
        <CardAction>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="size-4 text-primary" aria-hidden />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 px-4">
        <DispatchRow icon={Warehouse} value={facility.name} />
        <DispatchRow
          icon={Package}
          value={`${formatSummaryCount(facility.bags)} bags · ${formatNetWeight(dispatch.netWeight)}`}
        />
        {truck ? <DispatchRow icon={Truck} value={truck} /> : null}
        {dispatch.driverMobile ? (
          <DispatchRow icon={Phone} value={dispatch.driverMobile} muted />
        ) : null}
        <DispatchRow
          icon={CalendarDays}
          value={`Dispatched ${formatDispatchDate(dispatch.dispatchDate)}`}
          muted
        />
        {deliveredOn ? (
          <DispatchRow
            icon={CalendarDays}
            value={`Delivered ${formatDispatchDate(deliveredOn)}`}
            muted
          />
        ) : null}
        <div className="mt-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="tabular-nums">
              {farmers.received} / {farmers.total} farmers
            </span>
          </div>
          <Progress value={farmers.percent} className="h-1.5" />
        </div>
      </CardContent>

      <Separator className="mx-4" />

      <CardFooter className="justify-between gap-2 px-4">
        <Badge variant="outline" className={statusBadgeClass(dispatch.status)}>
          {formatSeedDispatchStatus(dispatch.status)}
        </Badge>
        <DispatchActions dispatch={dispatch} />
      </CardFooter>
    </Card>
  );
}
