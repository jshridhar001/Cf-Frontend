'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { FamilyAnalytics } from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import { formatAcres, formatPct } from '@/features/seed-requisition/analytics/lib/format';

const chartConfig = {
  acres: { label: 'Acres', color: 'var(--chart-1)' },
} satisfies ChartConfig;

type FamilyPoint = {
  name: string;
  acres: number;
  sharePct: number;
  stationName: string;
  accounts: number;
};

export function TopContributors({ families }: { families: FamilyAnalytics[] }) {
  const top = families.slice(0, 5);
  const captionCount = Math.min(3, families.length);
  const captionShare = families
    .slice(0, captionCount)
    .reduce((sum, family) => sum + family.sharePct, 0);
  const groupWord = captionCount === 1 ? 'group' : 'groups';
  const data: FamilyPoint[] = [...top].reverse().map((family) => ({
    name: family.label,
    acres: family.acres,
    sharePct: family.sharePct,
    stationName: family.stationName,
    accounts: family.accounts,
  }));

  if (top.length === 0) return null;

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Top contributors</CardTitle>
        <CardDescription>
          Top {captionCount} {groupWord} = {formatPct(captionShare)} of total acres
        </CardDescription>
      </PageCardHeader>
      <PageCardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height: Math.max(200, top.length * 48) }}
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
                    const row = payload?.[0]?.payload as FamilyPoint | undefined;
                    if (!row) return _label;
                    const accountWord = row.accounts === 1 ? 'account' : 'accounts';
                    return (
                      <div className="grid gap-1">
                        <span>{row.name}</span>
                        <span className="font-normal text-muted-foreground">
                          {formatPct(row.sharePct)} · {row.stationName} · {row.accounts}{' '}
                          {accountWord}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="acres" fill="var(--color-acres)" radius={4} />
          </BarChart>
        </ChartContainer>
      </PageCardContent>
    </PageCard>
  );
}
