const acresFormat = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const pctFormat = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export function formatAcres(value: number): string {
  return acresFormat.format(value);
}

export function formatPct(value: number): string {
  return `${pctFormat.format(value)}%`;
}

export function geographySubtitle(geography: {
  station: string[];
  district: string[];
  state: string[];
}): string {
  const part = (values: string[]) => (values.length > 0 ? values.join(' / ') : '');
  const station = geography.station.length === 1 ? geography.station[0] : '';
  const label = [station, part(geography.district), part(geography.state)].filter(Boolean);
  return label.join(', ');
}
