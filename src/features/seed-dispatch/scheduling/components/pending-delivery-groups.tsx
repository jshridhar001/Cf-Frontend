import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCalendarDayLabel } from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import {
  formatDateGroupSummary,
  formatPendingQuantity,
  type PendingDateGroup,
  type PendingDeliveryLine,
} from '@/features/seed-dispatch/scheduling/lib/pending-deliveries';

type PendingDeliveryGroupsProps = {
  groups: PendingDateGroup[];
  filteredEmpty: boolean;
  onApprove: (line: PendingDeliveryLine) => void;
};

export function PendingDeliveryGroups({
  groups,
  filteredEmpty,
  onApprove,
}: PendingDeliveryGroupsProps) {
  if (filteredEmpty) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No matching requests</EmptyTitle>
          <EmptyDescription>Try another date, station, or variety.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.date} className="flex flex-col gap-3">
          <div className="min-w-0">
            <p className="text-sm leading-none font-medium">{formatCalendarDayLabel(group.date)}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{formatDateGroupSummary(group)}</p>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border md:block">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Farmer</TableHead>
                  <TableHead className="font-semibold">Station</TableHead>
                  <TableHead className="font-semibold">Variety</TableHead>
                  <TableHead className="font-semibold">Quantity</TableHead>
                  <TableHead className="text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="font-medium">{line.farmerName || '—'}</div>
                    </TableCell>
                    <TableCell>{line.stationName || '—'}</TableCell>
                    <TableCell>{line.varietyName || '—'}</TableCell>
                    <TableCell className="tabular-nums">{formatPendingQuantity(line)}</TableCell>
                    <TableCell className="text-right">
                      <ApproveDeliveryButton line={line} onApprove={onApprove} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ItemGroup className="md:hidden">
            {group.lines.map((line) => (
              <Item key={line.id} variant="outline" size="sm" className="items-start">
                <ItemContent className="min-w-0">
                  <ItemTitle>{line.farmerName || '—'}</ItemTitle>
                  <ItemDescription className="line-clamp-2">
                    {[line.stationName, line.varietyName].filter(Boolean).join(' · ') || '—'}
                  </ItemDescription>
                  <p className="text-sm font-medium tabular-nums">{formatPendingQuantity(line)}</p>
                </ItemContent>
                <ItemActions className="shrink-0">
                  <ApproveDeliveryButton line={line} onApprove={onApprove} />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </section>
      ))}
    </div>
  );
}

function ApproveDeliveryButton({
  line,
  onApprove,
}: {
  line: PendingDeliveryLine;
  onApprove: (line: PendingDeliveryLine) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      className="min-h-11 md:min-h-8"
      disabled={line.deliveryId == null}
      aria-label={`Approve ${line.farmerName || 'farmer'}`}
      onClick={() => onApprove(line)}
    >
      <CheckIcon data-icon="inline-start" />
      Approve
    </Button>
  );
}
