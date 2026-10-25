'use client';

import { Pie, PieChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { StripSizeShare } from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-summary';
import { formatSeedSize } from '@/lib/format-seed-size';

const SLICE_COLORS = [
  'oklch(0.55 0.14 145)',
  'oklch(0.55 0.16 255)',
  'oklch(0.72 0.15 75)',
  'oklch(0.55 0.16 310)',
  'oklch(0.62 0.15 25)',
] as const;

type SizePoint = {
  size: string;
  name: string;
  weightKg: number;
  sharePct: number;
  fill: string;
};

type SizeCalloutProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  sharePct?: number;
};

function formatAmount(value: number) {
  return value.toFixed(3).replace(/\.?0+$/, '');
}

function formatShare(value: number) {
  return `${value.toFixed(1)}%`;
}

function calloutName(name: string) {
  return name.length > 16 ? `${name.slice(0, 15)}…` : name;
}

function SizeCalloutLabel({ cx, cy, midAngle, outerRadius, name, sharePct }: SizeCalloutProps) {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    outerRadius == null ||
    name == null ||
    sharePct == null
  ) {
    return null;
  }

  const radians = (-midAngle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const lineStart = { x: cx + cos * outerRadius, y: cy + sin * outerRadius };
  const lineEnd = { x: cx + cos * (outerRadius + 12), y: cy + sin * (outerRadius + 12) };
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path
        d={`M${lineStart.x},${lineStart.y}L${lineEnd.x},${lineEnd.y}`}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={1}
      />
      <text
        x={lineEnd.x + (cos >= 0 ? 4 : -4)}
        y={lineEnd.y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="currentColor"
        className="text-[11px] text-foreground"
      >
        {`${calloutName(name)}: ${formatShare(sharePct)}`}
      </text>
    </g>
  );
}

export function StripSizeMixChart({ sizes }: { sizes: StripSizeShare[] }) {
  const slices = sizes.filter((size) => size.weightKg > 0).sort((a, b) => b.weightKg - a.weightKg);
  if (slices.length === 0) return null;

  const data: SizePoint[] = slices.map((size, index) => {
    const key = `size${index}`;
    return {
      size: key,
      name: formatSeedSize(size.name),
      weightKg: size.weightKg,
      sharePct: size.sharePct,
      fill: `var(--color-${key})`,
    };
  });
  const chartConfig = {
    weightKg: { label: 'Weight' },
    ...Object.fromEntries(
      data.map((point, index) => [
        point.size,
        {
          label: point.name,
          color: SLICE_COLORS[index % SLICE_COLORS.length],
        },
      ]),
    ),
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">Size mix by weight</p>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-[5/4] w-full max-h-[280px] [&_.recharts-surface]:overflow-visible"
      >
        <PieChart margin={{ top: 20, right: 72, bottom: 20, left: 72 }}>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="size"
                formatter={(_value, _name, item) => {
                  const row = item.payload as SizePoint | undefined;
                  if (!row) return null;
                  return (
                    <div className="grid gap-1">
                      <span className="font-medium">{row.name}</span>
                      <span className="text-muted-foreground">
                        {formatAmount(row.weightKg)} kg · {formatShare(row.sharePct)}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <Pie
            data={data}
            dataKey="weightKg"
            nameKey="name"
            innerRadius="58%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1.5}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
            labelLine={false}
            label={SizeCalloutLabel}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
