import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  placeLevelLabel,
  type RequisitionAnalytics,
} from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { formatAcres, formatPct } from '@/features/seed-requisition/analytics/lib/format';

export function KpiStrip({ analytics }: { analytics: RequisitionAnalytics }) {
  const { totals, stations } = analytics;
  const topCount = Math.min(2, stations.length);
  const topShare = stations.slice(0, topCount).reduce((sum, station) => sum + station.sharePct, 0);
  const levelLabel = placeLevelLabel(analytics.placeLevel, topCount !== 1);
  const levelTitle = placeLevelLabel(analytics.placeLevel, true);
  const title = levelTitle.charAt(0).toUpperCase() + levelTitle.slice(1);

  const cards = [
    {
      label: 'Requested acres',
      value: formatAcres(totals.acres),
      detail: `${totals.requisitions} requisitions - ${formatAcres(totals.fulfilledAcres)} acres fulfilled`,
    },
    {
      label: 'Farmers',
      value: formatAcres(totals.farmers),
      detail: `in ${totals.familyGroups} family groups - avg ${formatAcres(totals.avgAcresPerFarmer)} acres each`,
    },
    {
      label: title,
      value: formatAcres(totals.stations),
      detail: `top ${topCount} ${levelLabel} = ${formatPct(topShare)} of acres`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <PageCard key={card.label}>
          <PageCardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
          </PageCardHeader>
          <PageCardContent>
            <p className="text-sm text-muted-foreground">{card.detail}</p>
          </PageCardContent>
        </PageCard>
      ))}
    </div>
  );
}
