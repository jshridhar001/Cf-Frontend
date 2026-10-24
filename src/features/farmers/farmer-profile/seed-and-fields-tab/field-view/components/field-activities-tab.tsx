import { format } from 'date-fns';
import {
  ChevronDown,
  Droplet,
  ImageIcon,
  Leaf,
  type LucideIcon,
  Pencil,
  Plus,
  Ruler,
  Scissors,
  Sprout,
  Trash2,
  Wheat,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { parseDateOnlyString } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFieldIrrigations } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-irrigations';
import { useFieldPlantations } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-plantations';
import { useFieldDehaulmings } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-dehaulmings';
import { useFieldRougings } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-rougings';
import { useFieldStripTestGroups } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-strip-test-groups';
import { AddIrrigationSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-irrigation-sheet';
import { AddPlantationSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-plantation-sheet';
import { AddDehaulmingSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-dehaulming-sheet';
import { AddRougingSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-rouging-sheet';
import { AddStripTestSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-strip-test-sheet';
import { DeleteIrrigationDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-irrigation-dialog';
import { DeletePlantationDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-plantation-dialog';
import { DeleteDehaulmingDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-dehaulming-dialog';
import { DeleteRougingDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-rouging-dialog';
import { DeleteStripTestDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-strip-test-dialog';
import type { Irrigation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';
import type { Plantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import type { Dehaulming } from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';
import type { Rouging } from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';
import {
  type StripTest,
  type StripTestGroup,
  type StripTestTuberRecord,
  stripTestTypeLabel,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';
import { formatSeedSize } from '@/lib/format-seed-size';
import { cn } from '@/lib/utils';

const ACTIVITY_STEPS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'plantation', label: 'Plantation', icon: Sprout },
  { id: 'irrigation', label: 'Irrigation', icon: Droplet },
  { id: 'rouging', label: 'Rouging', icon: Leaf },
  { id: 'strip-test', label: 'Strip test', icon: Ruler },
  { id: 'dehaulming', label: 'Dehaulming', icon: Scissors },
  { id: 'harvest', label: 'Harvest', icon: Wheat },
];

function formatPlantationDate(value: string) {
  const date = parseDateOnlyString(value);
  return date ? format(date, 'd MMM yyyy') : value;
}

function formatAmount(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : String(value);
}

function formatPlantCount(value: string | null) {
  if (value == null || value.trim() === '') return '—';
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(3) : value;
}

function formatMeasure(value: number | string | null | undefined) {
  if (value == null || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return amount.toFixed(3).replace(/\.?0+$/, '');
}

function groupTimelineDate(group: StripTestGroup) {
  return group.stripTests.reduce((earliest, strip) => {
    return strip.startDate < earliest ? strip.startDate : earliest;
  }, group.stripTests[0]?.startDate ?? group.createdAt.slice(0, 10));
}

function groupEyebrow(group: StripTestGroup) {
  const only = group.stripTests.length === 1 ? group.stripTests[0]?.type : undefined;
  if (only) return `Strip test · ${stripTestTypeLabel(only)}`;
  return 'Strip test';
}

function stepCountLabel(count: number) {
  return count === 1 ? '1 step recorded' : `${count} steps recorded`;
}

function photoCountLabel(count: number) {
  return count === 1 ? '1 photo' : `${count} photos`;
}

function ActivityRemarks({
  remarks,
  className,
}: {
  remarks: string | null | undefined;
  className?: string;
}) {
  const text = remarks?.trim();
  if (!text) return null;

  return (
    <div className={cn('mt-4', className)}>
      <p className="text-xs text-muted-foreground">Remarks</p>
      <p className="mt-1 text-sm leading-5 break-words">{text}</p>
    </div>
  );
}

function PlantationImage({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          'flex min-h-24 items-center justify-center bg-muted px-2 text-center text-xs text-muted-foreground',
          className,
        )}
      >
        Photo unavailable
      </span>
    );
  }

  return (
    <img src={url} alt={alt} loading="lazy" className={className} onError={() => setFailed(true)} />
  );
}

function ActivityPhotoDialog({
  photos,
  index,
  altPrefix,
  description,
  onIndexChange,
  onOpenChange,
}: {
  photos: string[];
  index: number | null;
  altPrefix: string;
  description: string;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const open = index != null;
  const current = index ?? 0;
  const url = photos[current];
  const hasMany = photos.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Photo {current + 1} of {photos.length}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {url ? (
          <PlantationImage
            key={`${url}-${current}`}
            url={url}
            alt={`${altPrefix} ${current + 1}`}
            className="max-h-[60vh] w-full rounded-lg object-contain"
          />
        ) : null}
        {hasMany ? (
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-8"
              onClick={() => onIndexChange((current - 1 + photos.length) % photos.length)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-8"
              onClick={() => onIndexChange((current + 1) % photos.length)}
            >
              Next
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PlantationCard({
  plantation,
  onEdit,
  onDelete,
}: {
  plantation: Plantation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photos = (plantation.mediaUrls ?? []).filter((url) => url.length > 0);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photosPanelId = `plantation-photos-${plantation.id}`;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
        <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-4 ring-background sm:size-9 dark:bg-amber-950 dark:text-amber-300">
          <Sprout className="size-4" />
        </span>
      </div>
      <article className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-amber-700 uppercase dark:text-amber-300">
              Plantation
            </p>
            <h3 className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base">
              Seed sown — {plantation.variety.name}
            </h3>
            {photos.length > 0 ? (
              <Badge variant="outline" className="mt-2">
                <ImageIcon />
                {photoCountLabel(photos.length)}
              </Badge>
            ) : null}
          </div>
          <time
            dateTime={plantation.startDate}
            className="shrink-0 pt-0.5 text-xs text-muted-foreground sm:text-sm"
          >
            {formatPlantationDate(plantation.startDate)}
          </time>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Variety
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{plantation.variety.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Seed size
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{plantation.size.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Bags used
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{formatAmount(plantation.bagCount)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Acres planted
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{formatAmount(plantation.acresPlanted)}</dd>
          </div>
        </dl>
        <ActivityRemarks remarks={plantation.remarks} />
        {photosOpen && photos.length > 0 ? (
          <ul id={photosPanelId} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((url, index) => (
              <li key={url}>
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  aria-label={`View plantation photo ${index + 1}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <PlantationImage
                    url={url}
                    alt={`Plantation photo ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {photos.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              aria-expanded={photosOpen}
              aria-controls={photosPanelId}
              onClick={() => {
                setPhotosOpen((open) => !open);
                setViewerIndex(null);
              }}
            >
              {photosOpen ? 'Hide photos' : 'See photos'}
              <ChevronDown className={cn('transition-transform', photosOpen && 'rotate-180')} />
            </Button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              onClick={onEdit}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
              onClick={onDelete}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
        <ActivityPhotoDialog
          photos={photos}
          index={viewerIndex}
          altPrefix="Plantation photo"
          description="Plantation photo from this step."
          onIndexChange={setViewerIndex}
          onOpenChange={(open) => {
            if (!open) setViewerIndex(null);
          }}
        />
      </article>
    </li>
  );
}

function nextCycleNumber(irrigations: Irrigation[] | undefined) {
  const highest = (irrigations ?? []).reduce((max, item) => Math.max(max, item.cycleNumber), 0);
  return highest + 1;
}

function IrrigationCard({
  irrigation,
  onEdit,
  onDelete,
}: {
  irrigation: Irrigation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photos = (irrigation.mediaUrls ?? []).filter((url) => url.length > 0);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photosPanelId = `irrigation-photos-${irrigation.id}`;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
        <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-sky-50 text-sky-700 ring-4 ring-background sm:size-9 dark:bg-sky-950 dark:text-sky-300">
          <Droplet className="size-4" />
        </span>
      </div>
      <article className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-sky-700 uppercase dark:text-sky-300">
              Irrigation · Cycle {irrigation.cycleNumber}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base">
              Cycle {irrigation.cycleNumber}
            </h3>
            {photos.length > 0 ? (
              <Badge variant="outline" className="mt-2">
                <ImageIcon />
                {photoCountLabel(photos.length)}
              </Badge>
            ) : null}
          </div>
          <time
            dateTime={irrigation.startDate}
            className="shrink-0 pt-0.5 text-xs text-muted-foreground sm:text-sm"
          >
            {formatPlantationDate(irrigation.startDate)}
          </time>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Cycle
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{irrigation.cycleNumber}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Start
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantationDate(irrigation.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              End
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantationDate(irrigation.endDate)}
            </dd>
          </div>
        </dl>
        <ActivityRemarks remarks={irrigation.remarks} />
        {photosOpen && photos.length > 0 ? (
          <ul id={photosPanelId} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((url, index) => (
              <li key={url}>
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  aria-label={`View irrigation photo ${index + 1}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <PlantationImage
                    url={url}
                    alt={`Irrigation photo ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {photos.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              aria-expanded={photosOpen}
              aria-controls={photosPanelId}
              onClick={() => {
                setPhotosOpen((open) => !open);
                setViewerIndex(null);
              }}
            >
              {photosOpen ? 'Hide photos' : 'See photos'}
              <ChevronDown className={cn('transition-transform', photosOpen && 'rotate-180')} />
            </Button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              onClick={onEdit}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
              onClick={onDelete}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
        <ActivityPhotoDialog
          photos={photos}
          index={viewerIndex}
          altPrefix="Irrigation photo"
          description="Irrigation photo from this step."
          onIndexChange={setViewerIndex}
          onOpenChange={(open) => {
            if (!open) setViewerIndex(null);
          }}
        />
      </article>
    </li>
  );
}

function RougingCard({
  rouging,
  onEdit,
  onDelete,
}: {
  rouging: Rouging;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photos = (rouging.mediaUrls ?? []).filter((url) => url.length > 0);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photosPanelId = `rouging-photos-${rouging.id}`;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
        <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-4 ring-background sm:size-9 dark:bg-emerald-950 dark:text-emerald-300">
          <Leaf className="size-4" />
        </span>
      </div>
      <article className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
              Rouging
            </p>
            <h3 className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base">Rouging</h3>
            {photos.length > 0 ? (
              <Badge variant="outline" className="mt-2">
                <ImageIcon />
                {photoCountLabel(photos.length)}
              </Badge>
            ) : null}
          </div>
          <time
            dateTime={rouging.startDate}
            className="shrink-0 pt-0.5 text-xs text-muted-foreground sm:text-sm"
          >
            {formatPlantationDate(rouging.startDate)}
          </time>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Start
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantationDate(rouging.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              End
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{formatPlantationDate(rouging.endDate)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Virus plants
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantCount(rouging.virusInfectedPlantsRemoved)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Off-variety
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantCount(rouging.offVarietyTypeRemoval)}
            </dd>
          </div>
        </dl>
        <ActivityRemarks remarks={rouging.remarks} />
        {photosOpen && photos.length > 0 ? (
          <ul id={photosPanelId} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((url, index) => (
              <li key={url}>
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  aria-label={`View rouging photo ${index + 1}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <PlantationImage
                    url={url}
                    alt={`Rouging photo ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {photos.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              aria-expanded={photosOpen}
              aria-controls={photosPanelId}
              onClick={() => {
                setPhotosOpen((open) => !open);
                setViewerIndex(null);
              }}
            >
              {photosOpen ? 'Hide photos' : 'See photos'}
              <ChevronDown className={cn('transition-transform', photosOpen && 'rotate-180')} />
            </Button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              onClick={onEdit}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
              onClick={onDelete}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
        <ActivityPhotoDialog
          photos={photos}
          index={viewerIndex}
          altPrefix="Rouging photo"
          description="Rouging photo from this step."
          onIndexChange={setViewerIndex}
          onOpenChange={(open) => {
            if (!open) setViewerIndex(null);
          }}
        />
      </article>
    </li>
  );
}

function DehaulmingCard({
  dehaulming,
  onEdit,
  onDelete,
}: {
  dehaulming: Dehaulming;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photos = (dehaulming.mediaUrls ?? []).filter((url) => url.length > 0);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photosPanelId = `dehaulming-photos-${dehaulming.id}`;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
        <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-orange-50 text-orange-700 ring-4 ring-background sm:size-9 dark:bg-orange-950 dark:text-orange-300">
          <Scissors className="size-4" />
        </span>
      </div>
      <article className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-orange-700 uppercase dark:text-orange-300">
              Dehaulming
            </p>
            <h3 className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base">Dehaulming</h3>
            {photos.length > 0 ? (
              <Badge variant="outline" className="mt-2">
                <ImageIcon />
                {photoCountLabel(photos.length)}
              </Badge>
            ) : null}
          </div>
          <time
            dateTime={dehaulming.startDate}
            className="shrink-0 pt-0.5 text-xs text-muted-foreground sm:text-sm"
          >
            {formatPlantationDate(dehaulming.startDate)}
          </time>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Start
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantationDate(dehaulming.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              End
            </dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatPlantationDate(dehaulming.endDate)}
            </dd>
          </div>
        </dl>
        <ActivityRemarks remarks={dehaulming.remarks} />
        {photosOpen && photos.length > 0 ? (
          <ul id={photosPanelId} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((url, index) => (
              <li key={url}>
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  aria-label={`View dehaulming photo ${index + 1}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <PlantationImage
                    url={url}
                    alt={`Dehaulming photo ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {photos.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              aria-expanded={photosOpen}
              aria-controls={photosPanelId}
              onClick={() => {
                setPhotosOpen((open) => !open);
                setViewerIndex(null);
              }}
            >
              {photosOpen ? 'Hide photos' : 'See photos'}
              <ChevronDown className={cn('transition-transform', photosOpen && 'rotate-180')} />
            </Button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 sm:min-h-8"
              onClick={onEdit}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
              onClick={onDelete}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
        <ActivityPhotoDialog
          photos={photos}
          index={viewerIndex}
          altPrefix="Dehaulming photo"
          description="Dehaulming photo from this step."
          onIndexChange={setViewerIndex}
          onOpenChange={(open) => {
            if (!open) setViewerIndex(null);
          }}
        />
      </article>
    </li>
  );
}

function sumMeasure(values: Array<number | string>) {
  return values.reduce((total, value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

const stripStatClass = 'bg-card px-2.5 py-2 sm:px-3 sm:py-2.5';

function StripSummary({ strip }: { strip: StripTest }) {
  const stems = strip.stemsPerPlant == null ? '—' : formatMeasure(strip.stemsPerPlant);
  const stats = [
    { label: 'Start', value: formatPlantationDate(strip.startDate) },
    { label: 'End', value: formatPlantationDate(strip.endDate) },
    { label: 'Length', value: formatMeasure(strip.stripLength) },
    { label: 'Width', value: formatMeasure(strip.stripWidth) },
    { label: 'Plants', value: formatMeasure(strip.numberOfPlants) },
    { label: 'Stems per plant', value: stems },
  ];

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className={stripStatClass}>
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      {strip.tuberRecords.length > 0 ? (
        <TuberRecordsTable records={strip.tuberRecords} />
      ) : null}
      <ActivityRemarks remarks={strip.remarks} className="mt-0" />
    </div>
  );
}

function TuberRecordsTable({ records }: { records: StripTestTuberRecord[] }) {
  const showTotal = records.length > 1;
  const totalQuantity = sumMeasure(records.map((record) => record.quantity));
  const totalWeight = sumMeasure(records.map((record) => record.weightKg));

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table aria-label="Tuber records" className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-auto w-[46%] px-2.5 py-2 text-xs font-medium whitespace-normal text-muted-foreground sm:px-3">
              Tuber size
            </TableHead>
            <TableHead className="h-auto w-[24%] px-2.5 py-2 text-right text-xs font-medium whitespace-normal text-muted-foreground sm:px-3">
              Quantity
            </TableHead>
            <TableHead className="h-auto w-[30%] px-2.5 py-2 text-right text-xs font-medium whitespace-normal text-muted-foreground sm:px-3">
              Weight (kg)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/40">
              <TableCell className="px-2.5 py-2 text-sm font-medium whitespace-normal sm:px-3">
                {formatSeedSize(record.tuberSize?.name ?? 'Tuber')}
              </TableCell>
              <TableCell className="px-2.5 py-2 text-right text-sm tabular-nums sm:px-3">
                {formatMeasure(record.quantity)}
              </TableCell>
              <TableCell className="px-2.5 py-2 text-right text-sm tabular-nums sm:px-3">
                {formatMeasure(record.weightKg)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {showTotal ? (
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell className="px-2.5 py-2 text-sm sm:px-3">Total</TableCell>
              <TableCell className="px-2.5 py-2 text-right text-sm tabular-nums sm:px-3">
                {formatMeasure(totalQuantity)}
              </TableCell>
              <TableCell className="px-2.5 py-2 text-right text-sm tabular-nums sm:px-3">
                {formatMeasure(totalWeight)}
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  );
}

function stripDateRange(startDate: string, endDate: string) {
  if (startDate === endDate) return formatPlantationDate(startDate);
  return `${formatPlantationDate(startDate)} – ${formatPlantationDate(endDate)}`;
}

function StripGroupOverview({ group }: { group: StripTestGroup }) {
  const strips = group.stripTests;
  const first = strips[0];
  if (!first) return null;

  const start = groupTimelineDate(group);
  const end = strips.reduce(
    (latest, strip) => (strip.endDate > latest ? strip.endDate : latest),
    first.endDate,
  );
  const types = [...new Set(strips.map((strip) => stripTestTypeLabel(strip.type)))];
  const records = strips.flatMap((strip) => strip.tuberRecords);
  const stats = [
    {
      label: 'Plants',
      value: formatMeasure(sumMeasure(strips.map((strip) => strip.numberOfPlants))),
    },
    { label: 'Tuber records', value: String(records.length) },
    {
      label: 'Quantity',
      value: formatMeasure(sumMeasure(records.map((record) => record.quantity))),
    },
    {
      label: 'Weight (kg)',
      value: formatMeasure(sumMeasure(records.map((record) => record.weightKg))),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {types.join(', ')} · {stripDateRange(start, end)}
      </p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={stripStatClass}>
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StripDetailCard({ strip, index }: { strip: StripTest; index: number }) {
  const photos = (strip.mediaUrls ?? []).filter((url) => url.length > 0);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photosPanelId = `strip-test-photos-${strip.id}`;

  return (
    <section className="rounded-xl border bg-muted/30 p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-medium">Strip {index + 1}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {stripDateRange(strip.startDate, strip.endDate)}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {stripTestTypeLabel(strip.type)}
        </Badge>
      </div>
      <StripSummary strip={strip} />
      {photosOpen && photos.length > 0 ? (
        <ul id={photosPanelId} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((url, photoIndex) => (
            <li key={url}>
              <button
                type="button"
                className="block w-full overflow-hidden rounded-lg border bg-card focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                aria-label={`View strip test photo ${photoIndex + 1}`}
                onClick={() => setViewerIndex(photoIndex)}
              >
                <PlantationImage
                  url={url}
                  alt={`Strip test photo ${photoIndex + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {photos.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 min-h-11 bg-card px-3 sm:min-h-8"
          aria-expanded={photosOpen}
          aria-controls={photosPanelId}
          onClick={() => {
            setPhotosOpen((open) => !open);
            setViewerIndex(null);
          }}
        >
          {photosOpen ? 'Hide photos' : 'See photos'}
          <ChevronDown className={cn('transition-transform', photosOpen && 'rotate-180')} />
        </Button>
      ) : null}
      <ActivityPhotoDialog
        photos={photos}
        index={viewerIndex}
        altPrefix="Strip test photo"
        description="Strip test photo from this step."
        onIndexChange={setViewerIndex}
        onOpenChange={(open) => {
          if (!open) setViewerIndex(null);
        }}
      />
    </section>
  );
}

function StripTestGroupCard({
  group,
  onEdit,
  onDelete,
}: {
  group: StripTestGroup;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photoCount = group.stripTests.reduce(
    (total, strip) => total + (strip.mediaUrls ?? []).filter((url) => url.length > 0).length,
    0,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = `strip-test-details-${group.id}`;
  const timelineDate = groupTimelineDate(group);
  const severalStrips = group.stripTests.length > 1;
  const hasStrips = group.stripTests.length > 0;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
        <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-violet-50 text-violet-700 ring-4 ring-background sm:size-9 dark:bg-violet-950 dark:text-violet-300">
          <Ruler className="size-4" />
        </span>
      </div>
      <article className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-violet-700 uppercase dark:text-violet-300">
              {groupEyebrow(group)}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight break-words sm:text-base">
              {group.name}
            </h3>
            {severalStrips || photoCount > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {severalStrips ? (
                  <Badge variant="secondary">{`${group.stripTests.length} strips`}</Badge>
                ) : null}
                {photoCount > 0 ? (
                  <Badge variant="secondary">
                    <ImageIcon />
                    {photoCountLabel(photoCount)}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
          <time
            dateTime={timelineDate}
            className="shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums sm:text-sm"
          >
            {formatPlantationDate(timelineDate)}
          </time>
        </div>
        {hasStrips ? (
          <div id={detailsId} className="mt-4 flex flex-col gap-3">
            {detailsOpen ? null : <StripGroupOverview group={group} />}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 w-full px-3 sm:min-h-8 sm:w-fit"
              aria-expanded={detailsOpen}
              aria-controls={detailsId}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              {detailsOpen ? 'View less' : 'View more'}
              <ChevronDown className={cn('transition-transform', detailsOpen && 'rotate-180')} />
            </Button>
            {detailsOpen ? (
              <div className="flex flex-col gap-6">
                {group.stripTests.map((strip, index) => (
                  <StripDetailCard key={strip.id} strip={strip} index={index} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 px-3 sm:min-h-8"
            onClick={onEdit}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
            onClick={onDelete}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </article>
    </li>
  );
}

type TimelineStep =
  | { kind: 'plantation'; startDate: string; createdAt: string; plantation: Plantation }
  | { kind: 'irrigation'; startDate: string; createdAt: string; irrigation: Irrigation }
  | { kind: 'rouging'; startDate: string; createdAt: string; rouging: Rouging }
  | { kind: 'dehaulming'; startDate: string; createdAt: string; dehaulming: Dehaulming }
  | { kind: 'strip-test'; startDate: string; createdAt: string; group: StripTestGroup };

export function FieldActivitiesTab({
  fieldId,
  fieldAcres,
}: {
  fieldId: string;
  fieldAcres: string;
}) {
  const plantationsQuery = useFieldPlantations(fieldId);
  const irrigationsQuery = useFieldIrrigations(fieldId);
  const rougingsQuery = useFieldRougings(fieldId);
  const dehaulmingsQuery = useFieldDehaulmings(fieldId);
  const stripTestsQuery = useFieldStripTestGroups(fieldId);
  const [plantationOpen, setPlantationOpen] = useState(false);
  const [editing, setEditing] = useState<Plantation | null>(null);
  const [deleting, setDeleting] = useState<Plantation | null>(null);
  const [irrigationOpen, setIrrigationOpen] = useState(false);
  const [editingIrrigation, setEditingIrrigation] = useState<Irrigation | null>(null);
  const [deletingIrrigation, setDeletingIrrigation] = useState<Irrigation | null>(null);
  const [rougingOpen, setRougingOpen] = useState(false);
  const [editingRouging, setEditingRouging] = useState<Rouging | null>(null);
  const [deletingRouging, setDeletingRouging] = useState<Rouging | null>(null);
  const [dehaulmingOpen, setDehaulmingOpen] = useState(false);
  const [editingDehaulming, setEditingDehaulming] = useState<Dehaulming | null>(null);
  const [deletingDehaulming, setDeletingDehaulming] = useState<Dehaulming | null>(null);
  const [stripTestOpen, setStripTestOpen] = useState(false);
  const [editingStripTest, setEditingStripTest] = useState<StripTestGroup | null>(null);
  const [deletingStripTest, setDeletingStripTest] = useState<StripTestGroup | null>(null);
  const isPending =
    plantationsQuery.isPending ||
    irrigationsQuery.isPending ||
    rougingsQuery.isPending ||
    dehaulmingsQuery.isPending ||
    stripTestsQuery.isPending;
  const steps = useMemo(() => {
    const items: TimelineStep[] = [
      ...(plantationsQuery.data ?? []).map((plantation) => ({
        kind: 'plantation' as const,
        startDate: plantation.startDate,
        createdAt: plantation.createdAt,
        plantation,
      })),
      ...(irrigationsQuery.data ?? []).map((irrigation) => ({
        kind: 'irrigation' as const,
        startDate: irrigation.startDate,
        createdAt: irrigation.createdAt,
        irrigation,
      })),
      ...(rougingsQuery.data ?? []).map((rouging) => ({
        kind: 'rouging' as const,
        startDate: rouging.startDate,
        createdAt: rouging.createdAt,
        rouging,
      })),
      ...(dehaulmingsQuery.data ?? []).map((dehaulming) => ({
        kind: 'dehaulming' as const,
        startDate: dehaulming.startDate,
        createdAt: dehaulming.createdAt,
        dehaulming,
      })),
      ...(stripTestsQuery.data ?? []).map((group) => ({
        kind: 'strip-test' as const,
        startDate: groupTimelineDate(group),
        createdAt: group.createdAt,
        group,
      })),
    ];
    return items.sort(
      (a, b) => a.startDate.localeCompare(b.startDate) || a.createdAt.localeCompare(b.createdAt),
    );
  }, [
    dehaulmingsQuery.data,
    irrigationsQuery.data,
    plantationsQuery.data,
    rougingsQuery.data,
    stripTestsQuery.data,
  ]);
  const queriesSettled =
    !plantationsQuery.isPending &&
    !irrigationsQuery.isPending &&
    !rougingsQuery.isPending &&
    !dehaulmingsQuery.isPending &&
    !stripTestsQuery.isPending;
  const queriesSucceeded =
    queriesSettled &&
    !plantationsQuery.isError &&
    !irrigationsQuery.isError &&
    !rougingsQuery.isError &&
    !dehaulmingsQuery.isError &&
    !stripTestsQuery.isError;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Timeline</h2>
          {isPending ? (
            <Skeleton className="mt-1.5 h-4 w-28" />
          ) : (
            <p className="text-sm text-muted-foreground">{stepCountLabel(steps.length)}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-11 shrink-0 px-4 sm:h-9">
              <Plus />
              Add step
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="min-w-56">
            {ACTIVITY_STEPS.map((step) => (
              <DropdownMenuItem
                key={step.id}
                onSelect={() => {
                  if (step.id === 'plantation') {
                    setEditing(null);
                    setPlantationOpen(true);
                    return;
                  }
                  if (step.id === 'irrigation') {
                    setEditingIrrigation(null);
                    setIrrigationOpen(true);
                    return;
                  }
                  if (step.id === 'rouging') {
                    setEditingRouging(null);
                    setRougingOpen(true);
                    return;
                  }
                  if (step.id === 'dehaulming') {
                    setEditingDehaulming(null);
                    setDehaulmingOpen(true);
                    return;
                  }
                  if (step.id === 'strip-test') {
                    setEditingStripTest(null);
                    setStripTestOpen(true);
                  }
                }}
              >
                <step.icon />
                {step.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isPending && steps.length === 0 ? <Skeleton className="h-36 w-full rounded-xl" /> : null}
      {plantationsQuery.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load plantations.</p>
      ) : null}
      {irrigationsQuery.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load irrigations.</p>
      ) : null}
      {rougingsQuery.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load rougings.</p>
      ) : null}
      {dehaulmingsQuery.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load dehaulmings.</p>
      ) : null}
      {stripTestsQuery.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load strip tests.</p>
      ) : null}
      {queriesSucceeded && steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No steps recorded yet.</p>
      ) : null}

      {steps.length > 0 ? (
        <ol className="relative flex flex-col gap-3">
          <span
            aria-hidden
            className="absolute top-6 bottom-6 left-4 border-l border-dashed border-border sm:left-5"
          />
          {steps.map((step) => {
            if (step.kind === 'plantation') {
              return (
                <PlantationCard
                  key={`plantation-${step.plantation.id}`}
                  plantation={step.plantation}
                  onEdit={() => {
                    setEditing(step.plantation);
                    setPlantationOpen(true);
                  }}
                  onDelete={() => setDeleting(step.plantation)}
                />
              );
            }
            if (step.kind === 'irrigation') {
              return (
                <IrrigationCard
                  key={`irrigation-${step.irrigation.id}`}
                  irrigation={step.irrigation}
                  onEdit={() => {
                    setEditingIrrigation(step.irrigation);
                    setIrrigationOpen(true);
                  }}
                  onDelete={() => setDeletingIrrigation(step.irrigation)}
                />
              );
            }
            if (step.kind === 'rouging') {
              return (
                <RougingCard
                  key={`rouging-${step.rouging.id}`}
                  rouging={step.rouging}
                  onEdit={() => {
                    setEditingRouging(step.rouging);
                    setRougingOpen(true);
                  }}
                  onDelete={() => setDeletingRouging(step.rouging)}
                />
              );
            }
            if (step.kind === 'dehaulming') {
              return (
                <DehaulmingCard
                  key={`dehaulming-${step.dehaulming.id}`}
                  dehaulming={step.dehaulming}
                  onEdit={() => {
                    setEditingDehaulming(step.dehaulming);
                    setDehaulmingOpen(true);
                  }}
                  onDelete={() => setDeletingDehaulming(step.dehaulming)}
                />
              );
            }
            return (
              <StripTestGroupCard
                key={`strip-test-${step.group.id}`}
                group={step.group}
                onEdit={() => {
                  setEditingStripTest(step.group);
                  setStripTestOpen(true);
                }}
                onDelete={() => setDeletingStripTest(step.group)}
              />
            );
          })}
        </ol>
      ) : null}

      <AddPlantationSheet
        fieldId={fieldId}
        fieldAcres={fieldAcres}
        plantation={editing}
        open={plantationOpen}
        onOpenChange={setPlantationOpen}
      />
      <DeletePlantationDialog
        plantation={deleting}
        open={deleting != null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
      <AddIrrigationSheet
        fieldId={fieldId}
        irrigation={editingIrrigation}
        suggestedCycle={nextCycleNumber(irrigationsQuery.data)}
        open={irrigationOpen}
        onOpenChange={setIrrigationOpen}
      />
      <DeleteIrrigationDialog
        irrigation={deletingIrrigation}
        open={deletingIrrigation != null}
        onOpenChange={(open) => {
          if (!open) setDeletingIrrigation(null);
        }}
      />
      <AddRougingSheet
        fieldId={fieldId}
        rouging={editingRouging}
        open={rougingOpen}
        onOpenChange={setRougingOpen}
      />
      <DeleteRougingDialog
        rouging={deletingRouging}
        open={deletingRouging != null}
        onOpenChange={(open) => {
          if (!open) setDeletingRouging(null);
        }}
      />
      <AddDehaulmingSheet
        fieldId={fieldId}
        dehaulming={editingDehaulming}
        open={dehaulmingOpen}
        onOpenChange={setDehaulmingOpen}
      />
      <DeleteDehaulmingDialog
        dehaulming={deletingDehaulming}
        open={deletingDehaulming != null}
        onOpenChange={(open) => {
          if (!open) setDeletingDehaulming(null);
        }}
      />
      <AddStripTestSheet
        fieldId={fieldId}
        group={editingStripTest}
        open={stripTestOpen}
        onOpenChange={setStripTestOpen}
      />
      <DeleteStripTestDialog
        group={deletingStripTest}
        open={deletingStripTest != null}
        onOpenChange={(open) => {
          if (!open) setDeletingStripTest(null);
        }}
      />
    </div>
  );
}
