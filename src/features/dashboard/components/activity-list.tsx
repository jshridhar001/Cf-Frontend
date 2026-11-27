import { Link } from '@tanstack/react-router';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { activityKindLabel } from '@/features/dashboard/lib/labels';
import type { DailyActivity } from '@/features/dashboard/types';

export function ActivityList({ activities }: { activities: DailyActivity[] }) {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Field work</CardTitle>
        <CardDescription>Entries whose start date is this day.</CardDescription>
      </PageCardHeader>
      <PageCardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No field work is dated this day.</p>
        ) : (
          <ul className="divide-y">
            {activities.map((activity) => (
              <li key={`${activity.kind}-${activity.id}`}>
                <Link
                  to="/farmers/$id/fields/$fieldId"
                  params={{ id: activity.farmerId, fieldId: activity.fieldId }}
                  className="flex flex-col gap-1 py-3 hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{activityKindLabel(activity.kind)}</Badge>
                      <p className="font-medium">
                        {activity.farmerName}
                        <span className="font-normal text-muted-foreground">
                          {' '}
                          · {activity.fieldName}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.summary}</p>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {activity.officerName} · {activity.stationName}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageCardContent>
    </PageCard>
  );
}
