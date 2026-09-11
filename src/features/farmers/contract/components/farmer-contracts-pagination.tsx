import type { PaginationState, ReactTable } from '@tanstack/react-table';
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
import type { FarmerContractTableFeatures } from '@/features/farmers/contract/lib/farmer-contract-table-features';
import {
  FARMER_CONTRACT_PAGE_SIZES,
  getPaginationItems,
  isFarmerContractPageSize,
} from '@/features/farmers/contract/lib/pagination';
import type { FarmerContractRow } from '@/features/farmers/contract/types';
import { cn } from '@/lib/utils';

export function FarmerContractsPagination({
  table,
}: {
  table: ReactTable<FarmerContractTableFeatures, FarmerContractRow>;
}) {
  const { pageIndex, pageSize } = table.state.pagination;
  const page = pageIndex + 1;
  const pageCount = Math.max(1, table.getPageCount());
  const rowCount = table.getRowCount();
  const rangeStart = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min(pageIndex * pageSize + pageSize, rowCount);
  const showPages = pageCount > 1 && rowCount > 0;
  const items = getPaginationItems(page, pageCount);
  const isFirst = !table.getCanPreviousPage();
  const isLast = !table.getCanNextPage();

  const goToPage = (next: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (next === page) return;
    table.setPageIndex(next - 1);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="min-w-0 text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground tabular-nums">
            {rangeStart}–{rangeEnd}
          </span>{' '}
          of <span className="font-medium text-foreground tabular-nums">{rowCount}</span> contracts
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const nextSize = Number(value);
              if (!isFarmerContractPageSize(nextSize) || nextSize === pageSize) return;
              table.setPagination({ pageIndex: 0, pageSize: nextSize } satisfies PaginationState);
            }}
          >
            <SelectTrigger
              aria-label="Contracts per page"
              className="h-11 w-full min-w-0 sm:h-9 sm:w-28"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FARMER_CONTRACT_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showPages ? (
        <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={isFirst ? (event) => event.preventDefault() : goToPage(page - 1)}
                aria-disabled={isFirst}
                className={cn(isFirst && 'pointer-events-none opacity-50')}
                tabIndex={isFirst ? -1 : undefined}
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
                onClick={isLast ? (event) => event.preventDefault() : goToPage(page + 1)}
                aria-disabled={isLast}
                className={cn(isLast && 'pointer-events-none opacity-50')}
                tabIndex={isLast ? -1 : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
