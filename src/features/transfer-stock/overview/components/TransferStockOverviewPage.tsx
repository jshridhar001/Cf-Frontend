import { Link } from '@tanstack/react-router';
import { ArrowLeftRight, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
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
import { formatFarmerLabel } from '@/features/transfer-stock/lib/format';
import { useStockTransfers } from '@/features/transfer-stock/overview/api/use-stock-transfers';
import { TransferLifecycleControls } from '@/features/transfer-stock/overview/components/transfer-lifecycle-controls';
import { TransferStatusBadge } from '@/features/transfer-stock/overview/components/transfer-status-badge';
import {
  filterStockTransfers,
  type TransferStatusFilter,
} from '@/features/transfer-stock/overview/lib/filter';
import {
  formatTransferDate,
  isStockTransferStatus,
  type StockTransfer,
  totalTransferBags,
} from '@/features/transfer-stock/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

const STATUS_FILTERS: Array<{ value: TransferStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'NULL', label: 'Null' },
];

export function TransferStockOverviewPage() {
  const { data, isPending, isError, error } = useStockTransfers();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TransferStatusFilter>('all');
  const [page, setPage] = useState(1);

  const transfers = data ?? [];
  const counts = useMemo(() => {
    const next = { all: transfers.length, PENDING: 0, RECEIVED: 0, NULL: 0 };
    for (const transfer of transfers) {
      if (isStockTransferStatus(transfer.status)) next[transfer.status] += 1;
    }
    return next;
  }, [transfers]);

  const filtered = useMemo(
    () => filterStockTransfers(transfers, query, status),
    [transfers, query, status],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasTransfers = transfers.length > 0;

  return (
    <PageCard className="border-border/50 min-w-0 shadow-sm">
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <ArrowLeftRight className="size-4" aria-hidden />
          </span>
          Transfer stock
        </CardTitle>
        <CardDescription className="hidden sm:block">
          Move seed bags from one farmer to another. Confirm receipt once the destination farmer has
          the stock.
        </CardDescription>
        <CardAction className="md:hidden">
          <Button asChild size="icon" className="min-h-11 min-w-11" aria-label="Create transfer">
            <Link to="/transfer-stock/create">
              <Plus />
            </Link>
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent className="flex min-w-0 flex-col gap-4">
        {isPending ? <DataTableSkeleton /> : null}
        {isError ? (
          <p className="text-destructive py-8 text-center text-sm">
            {getApiErrorMessage(error, 'Failed to load transfers.')}
          </p>
        ) : null}
        {!isPending && !isError && !hasTransfers ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ArrowLeftRight />
              </EmptyMedia>
              <EmptyTitle>No transfers yet</EmptyTitle>
              <EmptyDescription>
                Transfer seed bags from one farmer&apos;s stock to another.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/transfer-stock/create">Create transfer</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : null}

        {!isPending && !isError && hasTransfers ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUS_FILTERS.map((filter) => {
                const active = status === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={active}
                    className={cn(
                      'min-h-11 rounded-xl border px-3 py-2 text-left transition-colors',
                      active ? 'border-primary bg-primary/5' : 'border-border/70 hover:bg-muted/40',
                    )}
                    onClick={() => {
                      setStatus(filter.value);
                      setPage(1);
                    }}
                  >
                    <span className="text-muted-foreground text-xs">{filter.label}</span>
                    <span className="block text-lg font-semibold tabular-nums">
                      {counts[filter.value]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1 sm:max-w-sm">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search farmer, truck, or destination"
                  aria-label="Search transfers"
                  className="pl-10"
                  inputMode="search"
                />
              </div>
              <Button asChild className="hidden md:ml-auto md:flex">
                <Link to="/transfer-stock/create">
                  <Plus />
                  Create transfer
                </Link>
              </Button>
            </div>

            {filtered.length === 0 ? (
              <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
                No transfers match these filters.
              </p>
            ) : (
              <>
                <ItemGroup className="md:hidden">
                  {pageRows.map((transfer) => (
                    <TransferListItem key={transfer.id} transfer={transfer} />
                  ))}
                </ItemGroup>

                <div className="hidden overflow-hidden rounded-md border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Truck</TableHead>
                        <TableHead className="text-right">Bags</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRows.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell>
                            <Link
                              to="/transfer-stock/$id"
                              params={{ id: transfer.id }}
                              className="font-medium hover:underline"
                            >
                              {formatFarmerLabel(transfer.fromFarmer)}
                            </Link>
                          </TableCell>
                          <TableCell>{formatFarmerLabel(transfer.toFarmer)}</TableCell>
                          <TableCell className="max-w-48 truncate">{transfer.toLocation}</TableCell>
                          <TableCell className="uppercase">{transfer.truckNumber}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {totalTransferBags(transfer)}
                          </TableCell>
                          <TableCell>
                            {formatTransferDate(transfer.transferDate ?? transfer.createdAt)}
                          </TableCell>
                          <TableCell>
                            <TransferStatusBadge status={transfer.status} />
                          </TableCell>
                          <TableCell>
                            <TransferLifecycleControls transfer={transfer} variant="menu" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {pageCount > 1 ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-muted-foreground text-sm tabular-nums">
                      Page {currentPage} of {pageCount}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11 md:min-h-8"
                        disabled={currentPage <= 1}
                        onClick={() => setPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11 md:min-h-8"
                        disabled={currentPage >= pageCount}
                        onClick={() => setPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </PageCardContent>
    </PageCard>
  );
}

function TransferListItem({ transfer }: { transfer: StockTransfer }) {
  return (
    <Item variant="outline" size="sm">
      <ItemContent>
        <ItemTitle>
          <Link to="/transfer-stock/$id" params={{ id: transfer.id }} className="hover:underline">
            {transfer.fromFarmer.name} → {transfer.toFarmer.name}
          </Link>
        </ItemTitle>
        <ItemDescription>
          {transfer.truckNumber} · {transfer.toLocation} · {totalTransferBags(transfer)} bags ·{' '}
          {formatTransferDate(transfer.transferDate ?? transfer.createdAt)}
        </ItemDescription>
        <div className="pt-1">
          <TransferStatusBadge status={transfer.status} />
        </div>
      </ItemContent>
      <ItemActions>
        <TransferLifecycleControls transfer={transfer} variant="menu" />
      </ItemActions>
    </Item>
  );
}
