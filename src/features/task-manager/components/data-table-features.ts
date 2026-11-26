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
  createPaginatedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/react-table';
import {
  selectedValuesFilterFn,
  taskSearchFilterFn,
} from '@/features/task-manager/lib/selected-values-filter';

export type TaskColumnMeta = {
  filterLabel?: string;
};

export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnGroupingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  columnMeta: metaHelper<TaskColumnMeta>(),
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    selectedValues: selectedValuesFilterFn,
    taskSearch: taskSearchFilterFn,
  },
});

export type TaskTableFeatures = typeof features;
