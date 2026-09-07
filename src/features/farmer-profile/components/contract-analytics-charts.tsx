import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AREA_SHARE_DONUT_MAX,
  type ContractAnalytics,
  formatAcresWithUnit,
  formatSharePercent,
  type NamedAcres,
} from '@/features/farmer-profile/lib/contract-analytics';

const acresChartConfig = {
  acres: {
    label: 'Acres',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const;

const VARIETY_COLORS = [
  'oklch(0.72 0.14 251)',
  'oklch(0.70 0.14 155)',
  'oklch(0.74 0.13 80)',
  'oklch(0.68 0.14 320)',
  'oklch(0.72 0.14 30)',
  'oklch(0.68 0.12 200)',
  'oklch(0.66 0.13 280)',
  'oklch(0.72 0.12 130)',
] as const;

function varietyColor(index: number): string {
  return VARIETY_COLORS[index % VARIETY_COLORS.length];
}

function varietyColorByName(varietyNames: string[]): Map<string, string> {
  return new Map(varietyNames.map((name, index) => [name, varietyColor(index)]));
}

function chartHeight(categoryCount: number): number {
  return Math.min(420, Math.max(208, categoryCount * 36 + 24));
}

function yAxisWidth(names: string[]): number {
  const longest = names.reduce((max, name) => Math.max(max, name.length), 0);
  return Math.min(112, Math.max(72, longest * 7));
}

function truncateTick(value: string): string {
  return value.length > 14 ? `${value.slice(0, 13)}…` : value;
}

type ShareSlice = {
  key: string;
  name: string;
  acres: number;
  share: number;
  fill: string;
};

function toShareSlices(rows: NamedAcres[]): ShareSlice[] {
  return rows.map((row, index) => ({
    key: `s${index}`,
    name: row.name,
    acres: row.acres,
    share: row.share,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));
}

function shareChartConfig(slices: ShareSlice[]): ChartConfig {
  return Object.fromEntries(
    slices.map((slice) => [slice.key, { label: slice.name, color: slice.fill }]),
  );
}

export function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border">
      <div className="border-b px-4 py-3 sm:px-5">
        <h3 className="font-heading text-base font-medium">{title}</h3>
        {description ? (
          <p className="hidden text-sm text-muted-foreground sm:block">{description}</p>
        ) : null}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

function HorizontalAcreageChart({
  data,
  labelKey,
  colorByCategory = false,
}: {
  data: NamedAcres[];
  labelKey: string;
  colorByCategory?: boolean;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No contracted acres to chart.</p>;
  }

  const names = data.map((row) => row.name);
  const chartConfig = colorByCategory
    ? ({
        acres: { label: 'Acres' },
        ...Object.fromEntries(
          data.map((row, index) => [row.name, { label: row.name, color: varietyColor(index) }]),
        ),
      } satisfies ChartConfig)
    : acresChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full min-w-0"
      style={{ height: chartHeight(data.length) }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 72, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" dataKey="acres" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={yAxisWidth(names)}
          tickLine={false}
          axisLine={false}
          tickFormatter={truncateTick}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelKey="name"
              nameKey="acres"
              formatter={(value) => (
                <span className="font-mono font-medium tabular-nums">
                  {formatAcresWithUnit(Number(value))}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="acres" fill="var(--color-acres)" radius={4} maxBarSize={28} name={labelKey}>
          {colorByCategory
            ? data.map((row, index) => <Cell key={row.name} fill={varietyColor(index)} />)
            : null}
          <LabelList
            dataKey="acres"
            position="right"
            className="fill-muted-foreground text-[10px]"
            formatter={(value) => formatAcresWithUnit(Number(value ?? 0))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function AcreageByAreaChart({ data }: { data: NamedAcres[] }) {
  return <HorizontalAcreageChart data={data} labelKey="Area" />;
}

export function AcreageByVarietyChart({ data }: { data: NamedAcres[] }) {
  return <HorizontalAcreageChart data={data} labelKey="Variety" colorByCategory />;
}

function heatmapBackground(acres: number, maxCellAcres: number, color: string): string | undefined {
  if (acres <= 0 || maxCellAcres <= 0) return undefined;
  const intensity = Math.round((acres / maxCellAcres) * 58 + 14);
  return `color-mix(in oklch, ${color} ${intensity}%, transparent)`;
}

export function AreaVarietyHeatmap({ analytics }: { analytics: ContractAnalytics }) {
  const { areaNames, varietyNames, cellAcres, maxCellAcres } = analytics;

  if (areaNames.length === 0 || varietyNames.length === 0) {
    return <p className="text-sm text-muted-foreground">No area and variety combinations yet.</p>;
  }

  const colors = varietyColorByName(varietyNames);

  return (
    <Table>
      <TableHeader className="bg-muted">
        <TableRow className="hover:bg-transparent">
          <TableHead className="sticky left-0 z-10 min-w-28 bg-muted font-semibold">Area</TableHead>
          {varietyNames.map((variety) => (
            <TableHead key={variety} className="min-w-28 text-right font-semibold">
              <span className="inline-flex items-center justify-end gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: colors.get(variety) }}
                />
                {variety}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {areaNames.map((area) => (
          <TableRow key={area}>
            <TableCell className="sticky left-0 bg-card font-medium">{area}</TableCell>
            {varietyNames.map((variety) => {
              const acres = cellAcres[area]?.[variety] ?? 0;
              const color = colors.get(variety) ?? varietyColor(0);
              return (
                <TableCell
                  key={`${area}-${variety}`}
                  className="text-right tabular-nums"
                  style={{ backgroundColor: heatmapBackground(acres, maxCellAcres, color) }}
                >
                  {acres > 0 ? formatAcresWithUnit(acres) : '—'}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AcreageShareDonut({ slices, config }: { slices: ShareSlice[]; config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="aspect-auto mx-auto h-64 w-full max-w-md">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="key"
              formatter={(value, _name, item) => {
                const share = item.payload as ShareSlice | undefined;
                return (
                  <span className="font-mono font-medium tabular-nums">
                    {formatAcresWithUnit(Number(value))}
                    {share ? ` · ${formatSharePercent(share.share)}` : ''}
                  </span>
                );
              }}
            />
          }
        />
        <Pie
          data={slices}
          dataKey="acres"
          nameKey="key"
          innerRadius={58}
          outerRadius={84}
          strokeWidth={2}
        >
          {slices.map((slice) => (
            <Cell key={slice.key} fill={slice.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" className="flex-wrap" />} />
      </PieChart>
    </ChartContainer>
  );
}

function AcreageShareStackedBar({ slices, config }: { slices: ShareSlice[]; config: ChartConfig }) {
  const row = Object.fromEntries([
    ['name', 'Share'],
    ...slices.map((slice) => [slice.key, slice.share * 100]),
  ]);

  return (
    <ChartContainer config={config} className="aspect-auto h-28 w-full">
      <BarChart
        accessibilityLayer
        data={[row]}
        layout="vertical"
        margin={{ left: 0, right: 0, top: 8, bottom: 8 }}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="name" hide />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const slice = slices.find((entry) => entry.key === name);
                return (
                  <span className="font-mono font-medium tabular-nums">
                    {slice ? formatAcresWithUnit(slice.acres) : ''}
                    {` · ${formatSharePercent(Number(value) / 100)}`}
                  </span>
                );
              }}
            />
          }
        />
        {slices.map((slice) => (
          <Bar
            key={slice.key}
            dataKey={slice.key}
            stackId="share"
            fill={`var(--color-${slice.key})`}
            maxBarSize={28}
          />
        ))}
        <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
      </BarChart>
    </ChartContainer>
  );
}

export function AcreageShareChart({ data }: { data: NamedAcres[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No area share to display.</p>;
  }

  const slices = toShareSlices(data);
  const config = shareChartConfig(slices);

  if (slices.length > AREA_SHARE_DONUT_MAX) {
    return <AcreageShareStackedBar slices={slices} config={config} />;
  }

  return <AcreageShareDonut slices={slices} config={config} />;
}
