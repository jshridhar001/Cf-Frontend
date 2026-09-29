import {
  aggregationFn_sum,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';
import {
  advancedGlobalFilterFn,
  selectedValuesFilterFn,
} from '@/features/seed-dispatch/overview/lib/filter-fns';

export type DispatchColumnMeta = {
  filterLabel?: string;
  filterValueFormatter?: (value: unknown) => string;
};

export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnGroupingFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  columnMeta: metaHelper<DispatchColumnMeta>(),
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    selectedValues: selectedValuesFilterFn,
    advanced: advancedGlobalFilterFn,
  },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  aggregationFns: {
    sum: aggregationFn_sum,
  },
});

export type DataTableFeatures = typeof features;
