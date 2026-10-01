import {
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { awaitingColumns } from '@/features/seed-dispatch/overview/components/awaiting-dispatch-columns';
import { features } from '@/features/seed-dispatch/overview/components/data-table-features';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

export function useAwaitingRequisitionsTable({
  data,
  pagination,
  onPaginationChange,
}: {
  data: SeedRequisition[];
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'approvedDeliveryDate', desc: true },
  ]);

  return useTable({
    features,
    data,
    columns: awaitingColumns,
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    onPaginationChange,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });
}

export type AwaitingRequisitionsTable = ReturnType<typeof useAwaitingRequisitionsTable>;
