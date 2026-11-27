import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDashboardDate } from '@/features/dashboard/lib/dates';
import { activityKindLabel } from '@/features/dashboard/lib/labels';
import { ACTIVITY_KINDS, type ActivityKind, type DailyActivity } from '@/features/dashboard/types';

type KindFilter = 'all' | ActivityKind;

export function ActivityReportTable({ activities }: { activities: DailyActivity[] }) {
  const [kind, setKind] = useState<KindFilter>('all');
  const rows = useMemo(
    () => (kind === 'all' ? activities : activities.filter((activity) => activity.kind === kind)),
    [activities, kind],
  );

  return (
    <PageCard>
      <PageCardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle>All field work</CardTitle>
            <CardDescription>Every entry in the selected period, newest first.</CardDescription>
          </div>
          <Select value={kind} onValueChange={(value) => setKind(value as KindFilter)}>
            <SelectTrigger aria-label="Activity kind" className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {ACTIVITY_KINDS.map((activityKind) => (
                <SelectItem key={activityKind} value={activityKind}>
                  {activityKindLabel(activityKind)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageCardHeader>
      <PageCardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {kind === 'all'
              ? 'No field work in this period.'
              : `No ${activityKindLabel(kind).toLowerCase()} entries in this period.`}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((activity) => (
                <TableRow key={`${activity.kind}-${activity.id}`}>
                  <TableCell className="whitespace-nowrap">
                    {formatDashboardDate(activity.startDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activityKindLabel(activity.kind)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/farmers/$id/fields/$fieldId"
                      params={{ id: activity.farmerId, fieldId: activity.fieldId }}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {activity.farmerName}
                    </Link>
                  </TableCell>
                  <TableCell>{activity.fieldName}</TableCell>
                  <TableCell>{activity.stationName}</TableCell>
                  <TableCell>{activity.officerName}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {activity.summary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageCardContent>
    </PageCard>
  );
}
