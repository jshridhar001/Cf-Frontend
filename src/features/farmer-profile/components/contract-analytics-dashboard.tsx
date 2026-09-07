import { FileText, LandPlot, Layers, MapPinned, Sprout, Users } from 'lucide-react';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  AcreageByAreaChart,
  AcreageByVarietyChart,
  AcreageShareChart,
  AreaVarietyHeatmap,
  ChartPanel,
} from '@/features/farmer-profile/components/contract-analytics-charts';
import {
  type ContractAnalytics,
  formatAcresWithUnit,
} from '@/features/farmer-profile/lib/contract-analytics';

function KpiTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof FileText;
}) {
  return (
    <Item variant="muted" size="sm" className="min-w-0 flex-nowrap items-start">
      <ItemMedia variant="icon">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </div>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemDescription className="line-clamp-2 text-xs leading-tight font-medium tracking-wide uppercase">
          {label}
        </ItemDescription>
        <ItemTitle className="line-clamp-2">{value}</ItemTitle>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </ItemContent>
    </Item>
  );
}

function KeyInsights({ insights }: { insights: string[] }) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Not enough data for additional insights.</p>
    );
  }

  return (
    <ul className="ml-4 list-disc [&>li]:mt-2">
      {insights.map((insight) => (
        <li key={insight} className="text-sm leading-relaxed text-muted-foreground">
          {insight}
        </li>
      ))}
    </ul>
  );
}

export function ContractAnalyticsDashboard({ analytics }: { analytics: ContractAnalytics }) {
  if (analytics.totalContracts === 0) return null;

  const topAreaValue = analytics.topArea?.name ?? '—';
  const topAreaHint = analytics.topArea
    ? formatAcresWithUnit(analytics.topArea.acres)
    : 'No contracted acres';
  const topVarietyValue = analytics.topVariety?.name ?? '—';
  const topVarietyHint = analytics.topVariety
    ? formatAcresWithUnit(analytics.topVariety.acres)
    : 'No contracted acres';

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        <KpiTile
          label="Total Contracts"
          value={String(analytics.totalContracts)}
          hint="Signed contracts"
          icon={FileText}
        />
        <KpiTile
          label="Total Acres"
          value={formatAcresWithUnit(analytics.totalAcres)}
          hint="Currently contracted"
          icon={LandPlot}
        />
        <KpiTile
          label="Total Farmers"
          value={String(analytics.totalFarmers)}
          hint="With at least one contract"
          icon={Users}
        />
        <KpiTile
          label="Total Varieties"
          value={String(analytics.totalVarieties)}
          hint="Distinct varieties"
          icon={Layers}
        />
        <KpiTile label="Top Area" value={topAreaValue} hint={topAreaHint} icon={MapPinned} />
        <KpiTile label="Top Variety" value={topVarietyValue} hint={topVarietyHint} icon={Sprout} />
      </div>

      {analytics.byArea.length > 0 || analytics.byVariety.length > 0 ? (
        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
          <ChartPanel
            title="Contracted Acreage by Area"
            description="Stations ranked by total contracted acres."
          >
            <AcreageByAreaChart data={analytics.byArea} />
          </ChartPanel>
          <ChartPanel
            title="Contracted Acreage by Variety"
            description="Which varieties are driving contracted acreage."
          >
            <AcreageByVarietyChart data={analytics.byVariety} />
          </ChartPanel>
        </div>
      ) : null}

      {analytics.areaNames.length > 0 && analytics.varietyNames.length > 0 ? (
        <ChartPanel
          title="Area × Variety"
          description="Where each variety is contracted, and how much acreage that combination represents."
        >
          <AreaVarietyHeatmap analytics={analytics} />
        </ChartPanel>
      ) : null}

      {analytics.byArea.length > 0 ? (
        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
          <ChartPanel
            title="Acreage Share by Area"
            description="Where most of the contracted acreage is coming from."
          >
            <AcreageShareChart data={analytics.byArea} />
          </ChartPanel>
          <ChartPanel
            title="Key Insights"
            description="Patterns supported by the current contracts."
          >
            <KeyInsights insights={analytics.insights} />
          </ChartPanel>
        </div>
      ) : null}
    </div>
  );
}
