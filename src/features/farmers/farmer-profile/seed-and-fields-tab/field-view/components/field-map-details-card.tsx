import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { FieldSurvey } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/field-survey';
import type { FarmerField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';

export function FieldMapDetailsCard({
  field,
  survey,
}: {
  field: FarmerField;
  survey: FieldSurvey | null;
}) {
  const mapped = survey !== null;
  const acres = survey?.formattedArea.primary ?? storedAcresLabel(field.acres);
  const hectares = survey?.formattedArea.secondary ?? '—';
  const perimeter = survey?.formattedPerimeter ?? '—';
  const coords = survey ? formatCoordinates(survey.center[0], survey.center[1]) : '—';
  const farmerName = field.farmer?.name?.trim();
  const officerName = field.assignedOfficer?.name?.trim() || '—';

  return (
    <div className="absolute top-3 left-3 z-10 w-[min(15.5rem,calc(100%-1.5rem))]">
      <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-2.5 shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">{field.name}</h1>
            {farmerName ? (
              <p className="truncate text-xs text-muted-foreground">{farmerName}</p>
            ) : null}
          </div>
          <Badge
            className={
              mapped
                ? 'h-5 rounded-full bg-blue-100 px-1.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'h-5 rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground'
            }
          >
            <span
              className={
                mapped
                  ? 'size-1 rounded-full bg-blue-600'
                  : 'size-1 rounded-full bg-muted-foreground'
              }
            />
            {mapped ? 'Mapped' : 'Unmapped'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-md bg-indigo-50 px-2 py-1.5 dark:bg-indigo-950/40">
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Area</p>
            <p className="text-sm font-semibold tracking-tight">{acres}</p>
            <p className="text-[11px] text-muted-foreground">{hectares}</p>
          </div>
          <div className="rounded-md border px-2 py-1.5">
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Perimeter</p>
            <p className="text-sm font-semibold tracking-tight">{perimeter}</p>
            <p className="text-[11px] text-muted-foreground">Boundary</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <DetailRow label="Surveyed" value={formatSurveyedAt(field.createdAt)} />
          <DetailRow label="Officer" value={officerName} />
          <DetailRow label="Coords" value={coords} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-baseline gap-2 text-[11px] leading-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground/70">{value}</span>
    </div>
  );
}

function storedAcresLabel(acres: string) {
  const value = Number.parseFloat(acres);
  if (!Number.isFinite(value) || value <= 0) return '—';
  return `${value.toFixed(2)} acres`;
}

function formatCoordinates(lat: number, lng: number) {
  const latHemisphere = lat >= 0 ? 'N' : 'S';
  const lngHemisphere = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latHemisphere}, ${Math.abs(lng).toFixed(4)}°${lngHemisphere}`;
}

function formatSurveyedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'd MMM yyyy, h:mm a').replace(/AM|PM/g, (period) => period.toLowerCase());
}
