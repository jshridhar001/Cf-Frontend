import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type FarmerStockSummary,
  formatBagCount,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/pivot-farmer-stock';
import { cn } from '@/lib/utils';

export function FarmerStockSummaryTable({ summary }: { summary: FarmerStockSummary }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Varieties</TableHead>
            {summary.sizes.map((size) => (
              <TableHead key={size.key} className="text-right">
                {size.name}
              </TableHead>
            ))}
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.rows.map((row) => (
            <TableRow key={row.varietyId}>
              <TableCell className="font-medium">{row.varietyName}</TableCell>
              {summary.sizes.map((size) => {
                const bags = row.bagsBySizeKey[size.key] ?? 0;
                return (
                  <TableCell
                    key={size.key}
                    className={cn('text-right tabular-nums', bags === 0 && 'text-muted-foreground')}
                  >
                    {formatBagCount(bags)}
                  </TableCell>
                );
              })}
              <TableCell className="text-right font-medium text-primary tabular-nums">
                {formatBagCount(row.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Bag Total</TableCell>
            {summary.sizes.map((size) => {
              const bags = summary.columnTotals[size.key] ?? 0;
              return (
                <TableCell
                  key={size.key}
                  className={cn('text-right tabular-nums', bags === 0 && 'text-muted-foreground')}
                >
                  {formatBagCount(bags)}
                </TableCell>
              );
            })}
            <TableCell className="bg-primary/10 text-right font-medium text-primary tabular-nums">
              {formatBagCount(summary.grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
