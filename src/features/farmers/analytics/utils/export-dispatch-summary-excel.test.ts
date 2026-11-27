import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import type { DispatchRow } from '@/features/farmers/analytics/lib/compute-family-dispatch';
import { buildDispatchSummaryExcelPackage } from '@/features/farmers/analytics/utils/export-dispatch-summary-excel';

function dispatchRow(name: string, contracted: number, dispatched: number): DispatchRow {
  const remaining = Math.max(0, contracted - dispatched);
  return {
    key: name,
    name,
    contractedAcres: contracted,
    dispatchedAcres: dispatched,
    remainingAcres: remaining,
    percent: contracted > 0 ? Math.round((dispatched / contracted) * 100) : 0,
  };
}

describe('buildDispatchSummaryExcelPackage', () => {
  it('writes the sorted rows and totals as numbers with two decimal acres', async () => {
    const rows = [dispatchRow('Abhi Singh', 10, 4), dispatchRow('Ajit Singh Punia', 16, 6)];
    const pkg = await buildDispatchSummaryExcelPackage({
      rows,
      summary: {
        contractedAcres: 26,
        dispatchedAcres: 10,
        remainingAcres: 16,
        percent: 38,
      },
    });

    expect(pkg.fileName).toMatch(/^dispatch-summary-\d{4}-\d{2}-\d{2}\.xlsx$/);
    expect(pkg.preview.headers).toEqual([
      'Name',
      'Contracted (ac)',
      'Dispatched (ac)',
      'Remaining (ac)',
      'Sent %',
    ]);
    expect(pkg.preview.rows.map((row) => row.values[0])).toEqual([
      'Abhi Singh',
      'Ajit Singh Punia',
      'Total',
    ]);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(pkg.buffer);
    const sheet = workbook.getWorksheet('Dispatch summary');
    const header = sheet?.getRow(6);
    const first = sheet?.getRow(7);
    const total = sheet?.getRow(9);

    expect(header?.getCell(2).value).toBe('Contracted (ac)');
    expect(first?.getCell(1).value).toBe('Abhi Singh');
    expect(first?.getCell(2).value).toBe(10);
    expect(first?.getCell(2).numFmt).toBe('#,##0.00');
    expect(first?.getCell(5).value).toBe(40);
    expect(first?.getCell(5).numFmt).toBe('0"%"');
    expect(total?.getCell(1).value).toBe('Total');
    expect(total?.getCell(3).value).toBe(10);
    expect(total?.getCell(4).value).toBe(16);
  });
});
