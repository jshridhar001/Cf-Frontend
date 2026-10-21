import { format } from 'date-fns';
import {
  ChevronDown,
  Droplet,
  ImageIcon,
  Leaf,
  type LucideIcon,
  Pencil,
  Plus,
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
import { useFieldIrrigations } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-irrigations';
import { useFieldPlantations } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-plantations';
import { AddIrrigationSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-irrigation-sheet';
import { AddPlantationSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-plantation-sheet';
import { DeleteIrrigationDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-irrigation-dialog';
import { DeletePlantationDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-plantation-dialog';
import type { Irrigation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';
import type { Plantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import { cn } from '@/lib/utils';

const ACTIVITY_STEPS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'plantation', label: 'Plantation', icon: Sprout },
  { id: 'irrigation', label: 'Irrigation', icon: Droplet },
  { id: 'rouging', label: 'Rouging', icon: Leaf },
  { id: 'strip-test', label: 'Strip test', icon: Pencil },
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

function stepCountLabel(count: number) {
  return count === 1 ? '1 step recorded' : `${count} steps recorded`;
}

function photoCountLabel(count: number) {
  return count === 1 ? '1 photo' : `${count} photos`;
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
  const remarks = irrigation.remarks?.trim();

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
            <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight break-words sm:text-base">
              {remarks || `Cycle ${irrigation.cycleNumber}`}
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

type TimelineStep =
  | { kind: 'plantation'; startDate: string; createdAt: string; plantation: Plantation }
  | { kind: 'irrigation'; startDate: string; createdAt: string; irrigation: Irrigation };

export function FieldActivitiesTab({
  fieldId,
  fieldAcres,
}: {
  fieldId: string;
  fieldAcres: string;
}) {
  const plantationsQuery = useFieldPlantations(fieldId);
  const irrigationsQuery = useFieldIrrigations(fieldId);
  const [plantationOpen, setPlantationOpen] = useState(false);
  const [editing, setEditing] = useState<Plantation | null>(null);
  const [deleting, setDeleting] = useState<Plantation | null>(null);
  const [irrigationOpen, setIrrigationOpen] = useState(false);
  const [editingIrrigation, setEditingIrrigation] = useState<Irrigation | null>(null);
  const [deletingIrrigation, setDeletingIrrigation] = useState<Irrigation | null>(null);
  const isPending = plantationsQuery.isPending || irrigationsQuery.isPending;
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
    ];
    return items.sort(
      (a, b) => a.startDate.localeCompare(b.startDate) || a.createdAt.localeCompare(b.createdAt),
    );
  }, [irrigationsQuery.data, plantationsQuery.data]);
  const bothSettled = !plantationsQuery.isPending && !irrigationsQuery.isPending;
  const bothSucceeded = bothSettled && !plantationsQuery.isError && !irrigationsQuery.isError;

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
      {bothSucceeded && steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No steps recorded yet.</p>
      ) : null}

      {steps.length > 0 ? (
        <ol className="relative flex flex-col gap-3">
          <span
            aria-hidden
            className="absolute top-6 bottom-6 left-4 border-l border-dashed border-border sm:left-5"
          />
          {steps.map((step) =>
            step.kind === 'plantation' ? (
              <PlantationCard
                key={`plantation-${step.plantation.id}`}
                plantation={step.plantation}
                onEdit={() => {
                  setEditing(step.plantation);
                  setPlantationOpen(true);
                }}
                onDelete={() => setDeleting(step.plantation)}
              />
            ) : (
              <IrrigationCard
                key={`irrigation-${step.irrigation.id}`}
                irrigation={step.irrigation}
                onEdit={() => {
                  setEditingIrrigation(step.irrigation);
                  setIrrigationOpen(true);
                }}
                onDelete={() => setDeletingIrrigation(step.irrigation)}
              />
            ),
          )}
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
    </div>
  );
}
