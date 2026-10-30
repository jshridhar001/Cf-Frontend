import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ContractTable,
  ContractTableView,
  useReportTable,
} from '@/features/farmers/report/components/contract-table';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';

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
      station: { id: 'bazpur', name: 'Bazpur' },
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

describe('ContractTable', () => {
  it('renders the contract columns for null sizes and completed rows', () => {
    const html = renderToStaticMarkup(createElement(ContractTable, { data: rows }));

    expect(html).toContain('Abhi Singh S/O Om Pal Singh');
    expect(html).toContain('CF-2026-060');
    expect(html).toContain('Puranpur');
    expect(html).toContain('10 ac');
    expect(html).toContain('None yet');
    expect(html).toContain('40-52');
    expect(html).toContain('38 bags/ac');
    expect(html).toContain('Complete');
    expect(html).toContain('100% dispatched');
    expect(html).toContain('Requested 27 Oct 2026');
    expect(html).toContain('Approved');
    expect(html).toContain('Pending');
  });

  it('shows one progress bar for a farmer group', () => {
    const grouped = [
      rows[0],
      {
        ...rows[0],
        requisitionId: 'acres-more',
        requestedAcres: '10.00',
        dispatchedAcres: '5',
        dispatchedBags: 0,
      },
    ];

    function GroupedTable() {
      const table = useReportTable(grouped, ['farmer']);
      const leaves = table.getFilteredRowModel().rows.length;
      const visible = table.getRowModel().rows.length;
      return createElement(
        'div',
        null,
        createElement('span', { 'data-counts': `${leaves}:${visible}` }),
        createElement(ContractTableView, { table }),
      );
    }

    const html = renderToStaticMarkup(createElement(GroupedTable));

    expect(html).toContain('data-counts="2:');
    expect(html).not.toContain('data-counts="2:2"');
    expect(html).toContain('20 ac');
    expect(html).toContain('5 ac');
    expect(html).toContain('25% dispatched');
    expect(html).toContain('Collapse group');
  });
});
