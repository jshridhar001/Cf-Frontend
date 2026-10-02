import type { ChartConfig } from '@/components/ui/chart';

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'variety'
  );
}

export function varietyKeyMap(names: string[]): Map<string, string> {
  const keys = new Map<string, string>();
  const used = new Set<string>();

  for (const name of names) {
    const base = slug(name);
    let key = base;
    let suffix = 2;
    while (used.has(key)) {
      key = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(key);
    keys.set(name, key);
  }

  return keys;
}

export function varietyChartConfig(
  keys: Map<string, string>,
  colors: Map<string, string>,
): ChartConfig {
  const config: ChartConfig = {};
  for (const [name, key] of keys) {
    config[key] = { label: name, color: colors.get(name) ?? 'var(--chart-1)' };
  }
  return config;
}
