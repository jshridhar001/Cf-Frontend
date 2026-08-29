import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function ariaSortValue(sorted: false | 'asc' | 'desc') {
  if (sorted === 'asc') return 'ascending';
  if (sorted === 'desc') return 'descending';
  return 'none';
}

export function MasterTableSortHeader({
  canSort,
  sorted,
  onToggle,
  children,
}: {
  canSort: boolean;
  sorted: false | 'asc' | 'desc';
  onToggle?: (event: unknown) => void;
  children: ReactNode;
}) {
  if (!canSort) {
    return children;
  }

  const SortIcon =
    sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ChevronsUpDownIcon;

  return (
    <button
      type="button"
      className="group inline-flex cursor-pointer items-center gap-1.5 rounded-md text-left font-semibold outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={onToggle}
    >
      {children}
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        <SortIcon
          aria-hidden
          className={
            sorted
              ? 'size-3.5 text-foreground'
              : 'size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground'
          }
        />
      </span>
    </button>
  );
}
