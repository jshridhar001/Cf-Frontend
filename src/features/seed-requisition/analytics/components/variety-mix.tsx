'use client';

import { Pie, PieChart } from 'recharts';
import { PageCard, PageCardContent, PageCardFooter, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type {
  PlaceLevel,
  VarietyAnalytics,
} from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { placeLevelLabel } from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { formatAcres, formatPct } from '@/features/seed-requisition/analytics/lib/format';

type VarietyPoint = {
  variety: string;
  name: string;
  acres: number;
  sharePct: number;
  farmers: number;
  stations: number;
  topStation: string;
  topShare: number;
  avgAcres: number;
  fill: string;
};

export function VarietyMix({
  varieties,
  varietyKeys,
  chartConfig,
  placeLevel,
  varietyName,
  onVarietyChange,
}: {
  varieties: VarietyAnalytics[];
  varietyKeys: Map<string, string>;
  chartConfig: ChartConfig;
  placeLevel: PlaceLevel;
  varietyName: string | null;
  onVarietyChange: (varietyName: string | null) => void;
}) {
  const data: VarietyPoint[] = varieties.flatMap((variety) => {
    const key = varietyKeys.get(variety.name);
    if (!key) return [];
    return [
      {
        variety: key,
        name: variety.name,
        acres: variety.acres,
        sharePct: variety.sharePct,
        farmers: variety.farmers,
        stations: variety.stations,
        topStation: variety.topStation.name,
        topShare: variety.topStation.sharePct,
        avgAcres: variety.avgAcresPerRequisition,
        fill: `var(--color-${key})`,
      },
    ];
  });
  const lead = varieties[0];

  return (
    <PageCard className="flex flex-col">
      <PageCardHeader className="items-center pb-0">
        <CardTitle>Variety mix</CardTitle>
        <CardDescription>
          {varietyName ? `${varietyName} is selected. ` : null}
          Select a slice to filter stations.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-sector]:cursor-pointer"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="variety"
                  formatter={(value, _name, item) => {
                    const row = item.payload as VarietyPoint | undefined;
                    if (!row) return null;
                    return (
                      <div className="grid gap-1">
                        <span className="font-medium">
                          {row.name} · {formatAcres(Number(value))} acres
                        </span>
                        <span className="text-muted-foreground">
                          {formatPct(row.sharePct)} · {row.farmers} farmers · {row.stations}{' '}
                          {placeLevelLabel(placeLevel, row.stations !== 1)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatPct(row.topShare)} in {row.topStation} · avg{' '}
                          {formatAcres(row.avgAcres)} acres
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="acres"
              nameKey="variety"
              innerRadius={60}
              onClick={(_, index) => {
                const point = data[index];
                if (!point) return;
                onVarietyChange(varietyName === point.name ? null : point.name);
              }}
            />
          </PieChart>
        </ChartContainer>
      </PageCardContent>
      {lead ? (
        <PageCardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none font-medium">
            {lead.name} is {formatPct(lead.sharePct)} of requested acres
          </div>
          <div className="leading-none text-muted-foreground">
            {formatAcres(varieties.reduce((sum, variety) => sum + variety.acres, 0))} acres across{' '}
            {varieties.length} {varieties.length === 1 ? 'variety' : 'varieties'}
          </div>
        </PageCardFooter>
      ) : null}
    </PageCard>
  );
}
