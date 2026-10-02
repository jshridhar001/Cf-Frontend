'use client';

import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiStrip } from '@/features/seed-requisition/analytics/components/kpi-strip';
import { NeedsAttention } from '@/features/seed-requisition/analytics/components/needs-attention';
import { TopContributors } from '@/features/seed-requisition/analytics/components/top-contributors';
import { VarietyMix } from '@/features/seed-requisition/analytics/components/variety-mix';
import { StationDemand } from '@/features/seed-requisition/analytics/components/village-demand';
import {
  varietyChartConfig,
  varietyKeyMap,
} from '@/features/seed-requisition/analytics/lib/chart-config';
import {
  computeRequisitionAnalytics,
  nextPlaceLevel,
  type PlaceDrill,
  type PlaceScope,
  requisitionsInScope,
} from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { geographySubtitle } from '@/features/seed-requisition/analytics/lib/format';
import { varietyColorMap } from '@/features/seed-requisition/analytics/lib/variety-color';
import { useSeedRequisitions } from '@/features/seed-requisition/overview/api/use-seed-requisitions';
import { getApiErrorMessage } from '@/lib/api-client';

export function SeedRequisitionAnalyticsPage() {
  const { data, isPending, isError, error } = useSeedRequisitions();
  const [varietyName, setVarietyName] = useState<string | null>(null);
  const [drill, setDrill] = useState<PlaceDrill[]>([]);
  const scope = useMemo(() => {
    const next: PlaceScope = {};
    for (const step of drill) next[step.level] = step.id;
    return next;
  }, [drill]);
  const scoped = useMemo(() => (data ? requisitionsInScope(data, scope) : []), [data, scope]);
  const placeLevel = useMemo(() => {
    const after = drill.at(-1)?.level;
    if (!after) return 'station' as const;
    return nextPlaceLevel(scoped, after) ?? after;
  }, [drill, scoped]);
  const analytics = useMemo(
    () => (data ? computeRequisitionAnalytics(scoped, { groupBy: placeLevel }) : null),
    [data, scoped, placeLevel],
  );
  const varietyNames = useMemo(
    () => analytics?.varieties.map((variety) => variety.name) ?? [],
    [analytics],
  );
  const colors = useMemo(() => varietyColorMap(varietyNames), [varietyNames]);
  const varietyKeys = useMemo(() => varietyKeyMap(varietyNames), [varietyNames]);
  const chartConfig = useMemo(() => varietyChartConfig(varietyKeys, colors), [varietyKeys, colors]);
  if (
    analytics &&
    varietyName &&
    !analytics.varieties.some((variety) => variety.name === varietyName)
  ) {
    setVarietyName(null);
  }

  if (!data && isPending) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(error, 'Failed to load requisitions.')}
      </p>
    );
  }

  if (!data || !analytics) return null;

  const hasDemand = analytics.totals.requisitions > 0;
  const subtitle = geographySubtitle(analytics.geography);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="scroll-m-20 text-xl font-semibold tracking-tight">Analytics</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      {hasDemand ? (
        <>
          <KpiStrip analytics={analytics} />
          <StationDemand
            stations={analytics.stations}
            varietyNames={varietyNames}
            varietyKeys={varietyKeys}
            chartConfig={chartConfig}
            varietyName={varietyName}
            placeLevel={analytics.placeLevel}
            drill={drill}
            onVarietyChange={setVarietyName}
            onDrillChange={setDrill}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <VarietyMix
              varieties={analytics.varieties}
              varietyKeys={varietyKeys}
              chartConfig={chartConfig}
              placeLevel={analytics.placeLevel}
              varietyName={varietyName}
              onVarietyChange={setVarietyName}
            />
            <TopContributors families={analytics.families} />
          </div>
          <NeedsAttention findings={analytics.dataHealth} />
        </>
      ) : (
        <>
          <PageCard>
            <PageCardHeader>
              <CardTitle>No requisitions to analyze</CardTitle>
              <CardDescription>
                Rejected requisitions are left out of demand totals.
              </CardDescription>
            </PageCardHeader>
            <PageCardContent>
              <p className="text-sm text-muted-foreground">
                There is no requested acreage to summarize yet.
              </p>
            </PageCardContent>
          </PageCard>
          <NeedsAttention findings={analytics.dataHealth} />
        </>
      )}
    </div>
  );
}
