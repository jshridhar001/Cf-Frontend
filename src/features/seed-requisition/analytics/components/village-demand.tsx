'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { StationRequisitionsPanel } from '@/features/seed-requisition/analytics/components/village-requisitions-panel';
import {
  limitStations,
  type PlaceDrill,
  type PlaceLevel,
  placeLevelLabel,
  rankStations,
  type StationAnalytics,
} from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { formatAcres, formatPct } from '@/features/seed-requisition/analytics/lib/format';

type StationPoint = {
  stationId: string;
  name: string;
  sharePct: number;
  farmers: number;
  familyGroups: number;
  acresPerFarmer: number;
  isHot: boolean;
} & Record<string, string | number | boolean>;

function stationIdFromClick(entry: unknown): string | null {
  if (!entry || typeof entry !== 'object' || !('payload' in entry)) return null;
  const payload = entry.payload;
  if (!payload || typeof payload !== 'object' || !('stationId' in payload)) return null;
  return typeof payload.stationId === 'string' ? payload.stationId : null;
}

export function StationDemand({
  stations,
  varietyNames,
  varietyKeys,
  chartConfig,
  varietyName,
  placeLevel,
  drill,
  onVarietyChange,
  onDrillChange,
}: {
  stations: StationAnalytics[];
  varietyNames: string[];
  varietyKeys: Map<string, string>;
  chartConfig: ChartConfig;
  varietyName: string | null;
  placeLevel: PlaceLevel;
  drill: PlaceDrill[];
  onVarietyChange: (varietyName: string | null) => void;
  onDrillChange: (drill: PlaceDrill[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trackedVariety, setTrackedVariety] = useState(varietyName);
  const [trackedLevel, setTrackedLevel] = useState(placeLevel);
  if (trackedVariety !== varietyName || trackedLevel !== placeLevel) {
    setTrackedVariety(varietyName);
    setTrackedLevel(placeLevel);
    setSelectedId(null);
  }

  const ranked = useMemo(
    () => limitStations(rankStations(stations, varietyName, placeLevel)),
    [stations, varietyName, placeLevel],
  );
  const selected = ranked.find((station) => station.stationId === selectedId) ?? null;
  const series = useMemo(
    () =>
      varietyNames.filter((name) => ranked.some((station) => (station.byVariety[name] ?? 0) > 0)),
    [ranked, varietyNames],
  );
  const data = useMemo(
    () =>
      [...ranked].reverse().map((station) => {
        const point: StationPoint = {
          stationId: station.stationId,
          name: station.name,
          sharePct: station.sharePct,
          farmers: station.farmers,
          familyGroups: station.familyGroups,
          acresPerFarmer: station.acresPerFarmer,
          isHot: station.isHot,
        };
        for (const name of series) {
          const key = varietyKeys.get(name);
          if (key) point[key] = station.byVariety[name] ?? 0;
        }
        return point;
      }),
    [ranked, series, varietyKeys],
  );
  const hotNames = ranked.filter((station) => station.isHot).map((station) => station.name);
  const height = Math.max(240, ranked.length * 44);
  const levelLabel = placeLevelLabel(placeLevel);
  const canDrill = ranked.some((place) => place.childLevel && place.stationId !== '__other__');

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Demand by {levelLabel}</CardTitle>
        <CardDescription>
          {varietyName ? `Showing ${varietyName}. ` : null}
          {canDrill ? 'Select a bar to drill in.' : 'Select a bar to open requisitions.'}
          {hotNames.length > 0 ? ` Hot: ${hotNames.join(', ')}.` : null}
        </CardDescription>
      </PageCardHeader>
      <PageCardContent className="flex flex-col gap-4">
        {drill.length > 0 ? (
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => onDrillChange([])}
            >
              All stations
            </button>
            {drill.map((step, index) => (
              <span key={`${step.level}-${step.id}`} className="inline-flex items-center gap-1">
                <span className="text-muted-foreground">/</span>
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => onDrillChange(drill.slice(0, index + 1))}
                >
                  {step.name}
                </button>
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={varietyName === null ? 'default' : 'outline'}
            onClick={() => onVarietyChange(null)}
          >
            All
          </Button>
          {varietyNames.map((name) => (
            <Button
              key={name}
              type="button"
              size="sm"
              variant={varietyName === name ? 'default' : 'outline'}
              onClick={() => onVarietyChange(varietyName === name ? null : name)}
            >
              {name}
            </Button>
          ))}
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full [&_.recharts-bar-rectangle]:cursor-pointer"
          style={{ height }}
        >
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={108}
              tickFormatter={(value: string) =>
                value.length > 16 ? `${value.slice(0, 15)}…` : value
              }
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatAcres(Number(value))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_label, payload) => {
                    const row = payload?.[0]?.payload as StationPoint | undefined;
                    if (!row) return _label;
                    return (
                      <div className="grid gap-1">
                        <span>
                          {row.name}
                          {row.isHot ? ' · Hot' : ''}
                        </span>
                        <span className="font-normal text-muted-foreground">
                          {formatPct(row.sharePct)} · {row.farmers} farmers ({row.familyGroups}) ·{' '}
                          {formatAcres(row.acresPerFarmer)} acres/farmer
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((name, index) => {
              const key = varietyKeys.get(name);
              if (!key) return null;
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="acres"
                  fill={`var(--color-${key})`}
                  radius={index === series.length - 1 ? [0, 4, 4, 0] : 0}
                  onClick={(entry) => {
                    const id = stationIdFromClick(entry);
                    const place = ranked.find((station) => station.stationId === id);
                    if (!place) return;
                    if (place.stationId !== '__other__' && place.childLevel) {
                      onDrillChange([
                        ...drill,
                        { level: placeLevel, id: place.stationId, name: place.name },
                      ]);
                      return;
                    }
                    setSelectedId(place.stationId);
                  }}
                />
              );
            })}
          </BarChart>
        </ChartContainer>
      </PageCardContent>
      <StationRequisitionsPanel
        station={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </PageCard>
  );
}
