import { useEffect, useState } from 'react';

export const COLUMN_KEYS = [
  'status',
  'farmersReceived',
  'dispatchDate',
  'deliveredOn',
  'fromFacility',
  'destination',
  'remarks',
  'netWeightKg',
  'truckNumber',
  'driverMobile',
] as const;

export type ColumnKey = (typeof COLUMN_KEYS)[number];

export type ColumnHeadings = Record<ColumnKey, string>;

export const DEFAULT_COLUMN_HEADINGS: ColumnHeadings = {
  status: 'Status',
  farmersReceived: 'Farmers Received',
  dispatchDate: 'Dispatch Date',
  deliveredOn: 'Delivered On',
  fromFacility: 'From Facility',
  destination: 'Destination',
  remarks: 'Remarks',
  netWeightKg: 'Net Weight',
  truckNumber: 'Truck Number',
  driverMobile: 'Driver Mobile Number',
};

export const COLUMN_HEADINGS_STORAGE_KEY = 'seed-dispatches:column-headings';

export function getStoredColumnHeadings(): ColumnHeadings {
  if (typeof window === 'undefined') {
    return DEFAULT_COLUMN_HEADINGS;
  }

  try {
    const raw = localStorage.getItem(COLUMN_HEADINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_COLUMN_HEADINGS;
    }

    const parsed = JSON.parse(raw) as Partial<ColumnHeadings>;
    return {
      ...DEFAULT_COLUMN_HEADINGS,
      ...Object.fromEntries(
        COLUMN_KEYS.map((key) => [
          key,
          typeof parsed[key] === 'string' && parsed[key].trim()
            ? parsed[key].trim()
            : DEFAULT_COLUMN_HEADINGS[key],
        ]),
      ),
    } as ColumnHeadings;
  } catch {
    return DEFAULT_COLUMN_HEADINGS;
  }
}

export function useColumnHeadings() {
  const [headings, setHeadings] = useState<ColumnHeadings>(DEFAULT_COLUMN_HEADINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHeadings(getStoredColumnHeadings());
    setReady(true);
  }, []);

  return { headings, ready };
}
