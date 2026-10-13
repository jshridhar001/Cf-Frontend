import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatSeedSize } from '@/lib/format-seed-size';

export type TransferLineView = {
  key: string;
  varietyName: string;
  sizeName: string;
  generationName: string;
  bagQuantity: number;
};

type TransferLinesListProps = {
  lines: TransferLineView[];
};

export function TransferLinesList({ lines }: TransferLinesListProps) {
  const total = lines.reduce((sum, line) => sum + line.bagQuantity, 0);

  return (
    <>
      <ItemGroup className="md:hidden">
        {lines.map((line) => (
          <Item key={line.key} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>{line.varietyName}</ItemTitle>
              <ItemDescription>
                {formatSeedSize(line.sizeName)} · {line.generationName}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <span className="text-sm font-medium tabular-nums">{line.bagQuantity} bags</span>
            </ItemActions>
          </Item>
        ))}
        {lines.length > 1 ? (
          <p className="text-right text-sm font-medium tabular-nums">Total {total} bags</p>
        ) : null}
      </ItemGroup>

      <div className="hidden overflow-hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Variety</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Generation</TableHead>
              <TableHead className="text-right">Bags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.key}>
                <TableCell className="font-medium">{line.varietyName}</TableCell>
                <TableCell>{formatSeedSize(line.sizeName)}</TableCell>
                <TableCell>{line.generationName}</TableCell>
                <TableCell className="text-right tabular-nums">{line.bagQuantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {lines.length > 1 ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">{total}</TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
    </>
  );
}
