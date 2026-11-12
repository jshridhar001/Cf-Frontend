import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useReportTable } from '@/features/farmers/report/components/contract-table';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';
import {
  buildReportExportSnapshot,
  type ReportExportSnapshot,
} from '@/features/farmers/report/utils/export-farmers-report-excel';

const rows: FarmerReportRequisition[] = [
  {
    requisitionId: 'acres-pending',
    status: 'PENDING',
    requisitionDate: null,
    contractDate: '2026-10-04T00:00:00.000Z',
    farmer: {
      id: 'abhi',
      name: 'Abhi Singh S/O Om Pal Singh',
      accountNumber: 'CF-2026-060',
      station: { id: 'puranpur', name: 'Puranpur' },
      family: null,
    },
    variety: { id: 'b101', name: 'B101' },
    quantityUnit: 'ACRES',
    expectedSize: null,
    requestedBags: null,
    requestedAcres: '10.00',
    dispatchedBags: 0,
    dispatchedAcres: '0',
    remainingBags: null,
    remainingAcres: '10',
    dispatchedSizes: [],
  },
  {
    requisitionId: 'bags-done',
    status: 'APPROVED',
    requisitionDate: '2026-10-27T00:00:00.000Z',
    contractDate: '2026-10-29T00:00:00.000Z',
    farmer: {
      id: 'ajit',
      name: 'Ajit Singh Punia S/O Harkewal Singh',
      accountNumber: 'CF-2026-018',
      station: { id: 'puranpur', name: 'Puranpur' },
      family: { id: 'family', name: 'Ajit Singh Family' },
    },
    variety: { id: 'santana', name: 'Santana' },
    quantityUnit: 'BAGS',
    expectedSize: { id: 'size', name: '40-52', seedBagsPerAcre: 38 },
    requestedBags: 8,
    requestedAcres: '0.211',
    dispatchedBags: 8,
    dispatchedAcres: '0.211',
    remainingBags: 0,
    remainingAcres: '0',
    dispatchedSizes: [],
  },
];

function cell(snapshot: ReportExportSnapshot, rowIndex: number, columnId: string) {
  const columnIndex = snapshot.columnIds.indexOf(columnId);
  return snapshot.bodyRows[rowIndex]?.values[columnIndex];
}

function capture(
  data: FarmerReportRequisition[],
  grouping: string[] = [],
  visibility: Record<string, boolean> = {},
): ReportExportSnapshot {
  const holder: { snapshot?: ReportExportSnapshot } = {};

  function Probe() {
    const table = useReportTable(data, grouping, visibility);
    holder.snapshot = buildReportExportSnapshot(table);
    return null;
  }

  renderToStaticMarkup(createElement(Probe));
  if (!holder.snapshot) throw new Error('Export snapshot was not built.');
  return holder.snapshot;
}

describe('farmer report excel export', () => {
  it('exports family, a finished remaining quantity, and skips hidden columns', () => {
    const snapshot = capture(rows, [], { station: false });
    const finishedRow = snapshot.bodyRows.findIndex((row) =>
      row.values.some((value) => value === 'Ajit Singh Punia S/O Harkewal Singh (#CF-2026-018)'),
    );

    expect(snapshot.columnIds).not.toContain('station');
    expect(snapshot.columnIds).toContain('family');
    expect(cell(snapshot, 0, 'family')).toBe('Independent');
    expect(cell(snapshot, finishedRow, 'remaining')).toContain('0 bags');
  });

  it('puts the grouped requested total on the group row', () => {
    const snapshot = capture(rows, ['station']);
    const groupRow = snapshot.bodyRows.findIndex((row) => row.isGroupedOrAggregatedRow);
    const requested = cell(snapshot, groupRow, 'requested');

    expect(groupRow).toBeGreaterThanOrEqual(0);
    expect(requested).toContain('10.211 ac');
    expect(requested).toContain('8 bags');
    expect(cell(snapshot, groupRow, 'remaining')).toBe('10 ac');
    expect(snapshot.totalsValues[snapshot.columnIds.indexOf('remaining')]).toBe('10 ac');
  });
});
