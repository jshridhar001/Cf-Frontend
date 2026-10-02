const VARIETY_COLORS = [
  'oklch(0.58 0.16 250)',
  'oklch(0.62 0.15 155)',
  'oklch(0.68 0.16 65)',
  'oklch(0.58 0.18 25)',
  'oklch(0.55 0.16 310)',
  'oklch(0.62 0.12 200)',
  'oklch(0.62 0.16 125)',
  'oklch(0.58 0.16 350)',
];

function hashName(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export function varietyColorMap(names: string[]): Map<string, string> {
  const used = new Set<number>();
  const colors = new Map<string, string>();
  const sorted = [...new Set(names)].sort((a, b) => a.localeCompare(b));

  for (const name of sorted) {
    let index = hashName(name) % VARIETY_COLORS.length;
    let probe = 0;
    while (used.has(index) && probe < VARIETY_COLORS.length) {
      index = (index + 1) % VARIETY_COLORS.length;
      probe += 1;
    }
    used.add(index);
    colors.set(name, VARIETY_COLORS[index] ?? VARIETY_COLORS[0]);
  }

  return colors;
}
