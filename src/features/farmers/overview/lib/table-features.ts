import {
  aggregationFn_uniqueCount,
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
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';
import {
  advancedGlobalFilterFn,
  selectedValuesFilterFn,
} from '@/features/farmers/overview/lib/filter-fns';

export type FarmerColumnMeta = {
  filterLabel?: string;
  filterValueFormatter?: (value: unknown) => string;
};

export const farmerTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnGroupingFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSortingFeature,
  columnMeta: metaHelper<FarmerColumnMeta>(),
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    selectedValues: selectedValuesFilterFn,
    advanced: advancedGlobalFilterFn,
  },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  aggregationFns: {
    uniqueCount: aggregationFn_uniqueCount,
  },
});

export type FarmerTableFeatures = typeof farmerTableFeatures;
