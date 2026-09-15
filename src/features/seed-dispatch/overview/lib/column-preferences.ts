import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';

export const COLUMN_PREFERENCES_KEY = 'seed-dispatch-overview-columns.v1';
const PREFERENCES_VERSION = 1;

type StoredColumnPreferences = {
  version: number;
  hiddenColumnIds: string[];
  columnOrder: string[];
};

export type ColumnPreferences = {
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
};

function isStoredPreferences(value: unknown): value is StoredColumnPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredColumnPreferences>;
  return (
    candidate.version === PREFERENCES_VERSION &&
    Array.isArray(candidate.hiddenColumnIds) &&
    Array.isArray(candidate.columnOrder)
  );
}

export function visibilityFromHiddenIds(hiddenColumnIds: string[]): ColumnVisibilityState {
  return Object.fromEntries(hiddenColumnIds.map((id) => [id, false]));
}

export function hiddenIdsFromVisibility(visibility: ColumnVisibilityState): string[] {
  return Object.entries(visibility)
    .filter(([, visible]) => visible === false)
    .map(([id]) => id);
}

export function loadColumnPreferences(): ColumnPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COLUMN_PREFERENCES_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredPreferences(parsed)) return null;
    return {
      columnVisibility: visibilityFromHiddenIds(parsed.hiddenColumnIds),
      columnOrder: parsed.columnOrder,
    };
  } catch {
    return null;
  }
}

export function saveColumnPreferences(preferences: ColumnPreferences) {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredColumnPreferences = {
      version: PREFERENCES_VERSION,
      hiddenColumnIds: hiddenIdsFromVisibility(preferences.columnVisibility),
      columnOrder: preferences.columnOrder,
    };
    window.localStorage.setItem(COLUMN_PREFERENCES_KEY, JSON.stringify(payload));
  } catch {
    // Private mode can throw.
  }
}

export function clearColumnPreferences() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(COLUMN_PREFERENCES_KEY);
  } catch {
    // Private mode can throw.
  }
}

export const DEFAULT_COLUMN_PREFERENCES: ColumnPreferences = {
  columnVisibility: {},
  columnOrder: [],
};
