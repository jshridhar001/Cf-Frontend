import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export const COLUMN_PREFERENCES_KEY = 'farmers-table-columns.v1';
const PREFERENCES_VERSION = 1;

type PersistedColumnPreferences = {
  state: {
    hiddenColumnIds: string[];
    columnOrder: string[];
    customized: boolean;
  };
  version: number;
};

export type ColumnPreferences = {
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
};

type ColumnPreferencesState = {
  hiddenColumnIds: string[];
  columnOrder: string[];
  customized: boolean;
  setDefaults: (preferences: ColumnPreferences) => void;
  clearDefaults: () => void;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPersistedPreferences(value: unknown): value is PersistedColumnPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PersistedColumnPreferences>;
  return (
    candidate.version === PREFERENCES_VERSION &&
    !!candidate.state &&
    isStringArray(candidate.state.hiddenColumnIds) &&
    isStringArray(candidate.state.columnOrder) &&
    typeof candidate.state.customized === 'boolean'
  );
}

const memoryStorage = new Map<string, string>();

function createPreferencesStorage(): StateStorage {
  const canUseLocalStorage = () => {
    try {
      return typeof window !== 'undefined' && window.localStorage != null;
    } catch {
      return false;
    }
  };

  return {
    getItem: (name) => {
      try {
        const raw = canUseLocalStorage()
          ? window.localStorage.getItem(name)
          : (memoryStorage.get(name) ?? null);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isPersistedPreferences(parsed) ? raw : null;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        if (canUseLocalStorage()) {
          window.localStorage.setItem(name, value);
          return;
        }
        memoryStorage.set(name, value);
      } catch {
        memoryStorage.set(name, value);
      }
    },
    removeItem: (name) => {
      try {
        if (canUseLocalStorage()) window.localStorage.removeItem(name);
      } catch {
        // Private mode or a blocked storage API should not break the page.
      }
      memoryStorage.delete(name);
    },
  };
}

export function visibilityFromHiddenIds(hiddenColumnIds: string[]): ColumnVisibilityState {
  return Object.fromEntries(hiddenColumnIds.map((id) => [id, false]));
}

function hiddenIdsFromVisibility(visibility: ColumnVisibilityState): string[] {
  return Object.entries(visibility)
    .filter(([, visible]) => visible === false)
    .map(([id]) => id);
}

const emptyPreferences = {
  hiddenColumnIds: [] as string[],
  columnOrder: [] as string[],
  customized: false,
};

export const useColumnPreferencesStore = create<ColumnPreferencesState>()(
  persist(
    (set) => ({
      ...emptyPreferences,
      setDefaults: (preferences) =>
        set({
          hiddenColumnIds: hiddenIdsFromVisibility(preferences.columnVisibility),
          columnOrder: preferences.columnOrder,
          customized: true,
        }),
      clearDefaults: () => set(emptyPreferences),
    }),
    {
      name: COLUMN_PREFERENCES_KEY,
      version: PREFERENCES_VERSION,
      storage: createJSONStorage(createPreferencesStorage),
      partialize: (state) => ({
        hiddenColumnIds: state.hiddenColumnIds,
        columnOrder: state.columnOrder,
        customized: state.customized,
      }),
    },
  ),
);

export function builtInColumnVisibility(): ColumnVisibilityState {
  return {};
}

export function getColumnPreferences(): ColumnPreferences {
  const { hiddenColumnIds, columnOrder, customized } = useColumnPreferencesStore.getState();
  return {
    columnVisibility: customized ? visibilityFromHiddenIds(hiddenColumnIds) : {},
    columnOrder,
  };
}
