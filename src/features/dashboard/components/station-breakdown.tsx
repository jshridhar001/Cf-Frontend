import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAcres } from '@/features/dashboard/lib/labels';
import type { DailyActivityStation } from '@/features/dashboard/types';

export function StationBreakdown({ stations }: { stations: DailyActivityStation[] }) {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>By station</CardTitle>
        <CardDescription>
          Activity, acres planted, and fields worked in this period.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent>
        {stations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No station activity in this period.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead className="text-right">Activities</TableHead>
                <TableHead className="text-right">Acres planted</TableHead>
                <TableHead className="text-right">Fields worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station) => (
                <TableRow key={station.stationId}>
                  <TableCell className="font-medium">{station.stationName}</TableCell>
                  <TableCell className="text-right tabular-nums">{station.activityCount}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAcres(station.acresPlanted)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{station.fieldsWorked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageCardContent>
    </PageCard>
  );
}
