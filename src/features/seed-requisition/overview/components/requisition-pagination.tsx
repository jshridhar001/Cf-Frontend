import type { MouseEvent } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RequisitionsTable } from '@/features/seed-requisition/overview/components/use-requisitions-table';
import { getPaginationItems } from '@/features/seed-requisition/overview/lib/pagination';
import {
  isSeedRequisitionPageSize,
  SEED_REQUISITION_PAGE_SIZES,
} from '@/features/seed-requisition/overview/types';
import { cn } from '@/lib/utils';

export function RequisitionPagination({ table }: { table: RequisitionsTable }) {
  const { pageIndex, pageSize } = table.state.pagination;
  const page = pageIndex + 1;
  const totalPages = Math.max(1, table.getPageCount());
  const leafCount = table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped()).length;
  const grouped = table.state.grouping.length > 0;
  const from = leafCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(leafCount, (pageIndex + 1) * pageSize);
  const showPages = totalPages > 1 && leafCount > 0;
  const items = getPaginationItems(page, totalPages);
  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  const goToPage = (next: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (next === page) return;
    table.setPageIndex(next - 1);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const nextSize = Number(value);
              if (!isSeedRequisitionPageSize(nextSize) || nextSize === pageSize) return;
              table.setPageSize(nextSize);
            }}
          >
            <SelectTrigger
              aria-label="Requisitions per page"
              className="h-11 w-full min-w-0 sm:h-9 sm:w-28"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEED_REQUISITION_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {leafCount === 0
            ? 'No rows'
            : grouped
              ? `${leafCount.toLocaleString('en-IN')} (grouped)`
              : `Showing ${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')} of ${leafCount.toLocaleString('en-IN')}`}
        </p>
      </div>

      {showPages ? (
        <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={
                  canPrevious
                    ? (event) => {
                        event.preventDefault();
                        table.previousPage();
                      }
                    : (event) => event.preventDefault()
                }
                aria-disabled={!canPrevious}
                className={cn(!canPrevious && 'pointer-events-none opacity-50')}
                tabIndex={canPrevious ? undefined : -1}
              />
            </PaginationItem>
            {items.map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationItem key={index === 1 ? 'ellipsis-start' : 'ellipsis-end'}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink href="#" isActive={item === page} onClick={goToPage(item)}>
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={
                  canNext
                    ? (event) => {
                        event.preventDefault();
                        table.nextPage();
                      }
                    : (event) => event.preventDefault()
                }
                aria-disabled={!canNext}
                className={cn(!canNext && 'pointer-events-none opacity-50')}
                tabIndex={canNext ? undefined : -1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
