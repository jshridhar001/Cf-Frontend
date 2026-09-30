import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export const COLUMN_PREFERENCES_KEY = 'seed-requisition-overview-columns.v1';
const PREFERENCES_VERSION = 1;

type StoredColumnPreferences = {
  version: number;
  hiddenColumnIds: string[];
  columnOrder: string[];
};

type PersistedColumnPreferences = {
  state: {
    hiddenColumnIds: string[];
    columnOrder: string[];
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

export const DEFAULT_HIDDEN_ADDRESS_COLUMN_IDS = [
  'state',
  'district',
  'policeStation',
  'pincode',
  'postOffice',
  'village',
] as const;

const ADDRESS_COLUMN_IDS = [
  'state',
  'district',
  'station',
  'policeStation',
  'pincode',
  'postOffice',
  'village',
];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isStoredPreferences(value: unknown): value is StoredColumnPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredColumnPreferences>;
  return (
    candidate.version === PREFERENCES_VERSION &&
    isStringArray(candidate.hiddenColumnIds) &&
    isStringArray(candidate.columnOrder)
  );
}

function isPersistedPreferences(value: unknown): value is PersistedColumnPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PersistedColumnPreferences>;
  return (
    candidate.version === PREFERENCES_VERSION &&
    !!candidate.state &&
    isStringArray(candidate.state.hiddenColumnIds) &&
    isStringArray(candidate.state.columnOrder)
  );
}

function toPersistedPayload(hiddenColumnIds: string[], columnOrder: string[]) {
  return JSON.stringify({
    state: { hiddenColumnIds, columnOrder },
    version: PREFERENCES_VERSION,
  });
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
        if (isPersistedPreferences(parsed)) return raw;
        if (isStoredPreferences(parsed)) {
          return toPersistedPayload(parsed.hiddenColumnIds, parsed.columnOrder);
        }
        return null;
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

export function hiddenIdsFromVisibility(visibility: ColumnVisibilityState): string[] {
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
  return visibilityFromHiddenIds([...DEFAULT_HIDDEN_ADDRESS_COLUMN_IDS]);
}

function withAddressColumns(columnOrder: string[]): string[] {
  if (columnOrder.length === 0) return columnOrder;
  const missing = ADDRESS_COLUMN_IDS.filter((id) => !columnOrder.includes(id));
  if (missing.length === 0) return columnOrder;
  const next = [...columnOrder];
  const villageIndex = next.indexOf('village');
  const farmerIndex = next.indexOf('farmer');
  const insertAt =
    villageIndex >= 0 ? villageIndex : farmerIndex >= 0 ? farmerIndex + 1 : next.length;
  next.splice(insertAt, 0, ...missing);
  return next;
}

const CONTRACT_URL_COLUMN_IDS = ['engContractUrl', 'hindiContractUrl'] as const;

function withContractUrlColumns(columnOrder: string[]): string[] {
  if (columnOrder.length === 0) return columnOrder;
  const missing = CONTRACT_URL_COLUMN_IDS.filter((id) => !columnOrder.includes(id));
  if (missing.length === 0) return columnOrder;
  const next = [...columnOrder];
  const contractDateIndex = next.indexOf('contractDate');
  const requisitionDateIndex = next.indexOf('requisitionDate');
  const insertAt =
    contractDateIndex >= 0
      ? contractDateIndex + 1
      : requisitionDateIndex >= 0
        ? requisitionDateIndex
        : next.length;
  next.splice(insertAt, 0, ...missing);
  return next;
}

function withContractDateColumn(columnOrder: string[]): string[] {
  if (columnOrder.length === 0 || columnOrder.includes('contractDate')) return columnOrder;
  const next = [...columnOrder];
  const acresIndex = next.indexOf('acres');
  const requisitionDateIndex = next.indexOf('requisitionDate');
  const insertAt =
    acresIndex >= 0
      ? acresIndex + 1
      : requisitionDateIndex >= 0
        ? requisitionDateIndex
        : next.length;
  next.splice(insertAt, 0, 'contractDate');
  return next;
}

export function getColumnPreferences(): ColumnPreferences {
  const { hiddenColumnIds, columnOrder, customized } = useColumnPreferencesStore.getState();
  return {
    columnVisibility: customized
      ? visibilityFromHiddenIds(hiddenColumnIds)
      : builtInColumnVisibility(),
    columnOrder: withContractUrlColumns(withContractDateColumn(withAddressColumns(columnOrder))),
  };
}

export const DEFAULT_COLUMN_PREFERENCES: ColumnPreferences = {
  columnVisibility: builtInColumnVisibility(),
  columnOrder: [],
};
