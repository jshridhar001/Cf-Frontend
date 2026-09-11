import { getRouteApi } from '@tanstack/react-router';
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
import { getPaginationItems } from '@/features/seed-requisition/overview/lib/pagination';
import type { SeedRequisitionSearch } from '@/features/seed-requisition/overview/lib/search';
import {
  isSeedRequisitionPageSize,
  SEED_REQUISITION_PAGE_SIZES,
} from '@/features/seed-requisition/overview/types';
import { cn } from '@/lib/utils';

const overviewRoute = getRouteApi('/_authenticated/seed-requisition/overview');

function pageHref(search: SeedRequisitionSearch, page: number) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(search.pageSize));
  if (search.status) params.set('status', search.status);
  if (search.farmerId) params.set('farmerId', search.farmerId);
  if (search.varietyId) params.set('varietyId', search.varietyId);
  if (search.requisitionDateFrom) params.set('requisitionDateFrom', search.requisitionDateFrom);
  if (search.requisitionDateTo) params.set('requisitionDateTo', search.requisitionDateTo);
  return `?${params.toString()}`;
}

export function RequisitionPagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const search = overviewRoute.useSearch();
  const navigate = overviewRoute.useNavigate();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showPages = totalPages > 1 && total > 0;

  const items = getPaginationItems(page, totalPages);
  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const goToPage = (next: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (next === page) return;
    void navigate({
      search: (prev) => ({ ...prev, page: next }),
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-sm text-muted-foreground">Per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            const nextSize = Number(value);
            if (!isSeedRequisitionPageSize(nextSize) || nextSize === pageSize) return;
            void navigate({
              search: (prev) => ({ ...prev, page: 1, pageSize: nextSize }),
            });
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

      {showPages ? (
        <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={pageHref(search, previousPage)}
                onClick={isFirst ? (event) => event.preventDefault() : goToPage(previousPage)}
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
                  <PaginationLink
                    href={pageHref(search, item)}
                    isActive={item === page}
                    onClick={goToPage(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href={pageHref(search, nextPage)}
                onClick={isLast ? (event) => event.preventDefault() : goToPage(nextPage)}
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
