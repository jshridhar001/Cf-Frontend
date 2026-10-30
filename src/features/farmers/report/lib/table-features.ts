import {
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
  metaHelper,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';
import { selectedValuesFilterFn } from '@/features/seed-requisition/overview/lib/filter-fns';

export type ReportColumnMeta = {
  filterLabel?: string;
  filterValueFormatter?: (value: unknown) => string;
};

export const reportTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnGroupingFeature,
  rowExpandingFeature,
  rowSortingFeature,
  columnMeta: metaHelper<ReportColumnMeta>(),
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { selectedValues: selectedValuesFilterFn },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

export type ReportTableFeatures = typeof reportTableFeatures;
