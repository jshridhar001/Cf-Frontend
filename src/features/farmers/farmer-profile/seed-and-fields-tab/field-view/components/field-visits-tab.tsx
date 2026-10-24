import { format } from 'date-fns';
import { ChevronDown, ClipboardCheck, ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useFieldVisits } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-visits';
import { AddFieldVisitSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-field-visit-sheet';
import { DeleteFieldVisitDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-field-visit-dialog';
import type { FieldVisit } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-visit-types';
import { cn } from '@/lib/utils';

function formatVisitDate(value: string) {
  const date = parseDateOnlyString(value);
  return date ? format(date, 'd MMM yyyy') : value;
}

function visitCountLabel(count: number) {
  return count === 1 ? '1 visit recorded' : `${count} visits recorded`;
}

function photoCountLabel(count: number) {
  return count === 1 ? '1 photo' : `${count} photos`;
}

function VisitImage({ url, alt, className }: { url: string; alt: string; className?: string }) {
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

function VisitPhotoDialog({
  photos,
  index,
  onIndexChange,
  onOpenChange,
}: {
  photos: string[];
  index: number | null;
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
          <DialogDescription>Field visit photo from this check-up.</DialogDescription>
        </DialogHeader>
        {url ? (
          <VisitImage
            key={`${url}-${current}`}
            url={url}
            alt={`Field visit photo ${current + 1}`}
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

function FieldVisitCard({
  visit,
  onEdit,
  onDelete,
}: {
  visit: FieldVisit;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photos = (visit.mediaUrls ?? []).filter((url) => url.length > 0);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photosPanelId = `field-visit-photos-${visit.id}`;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
        <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-4 ring-background sm:size-9 dark:bg-teal-950 dark:text-teal-300">
          <ClipboardCheck className="size-4" />
        </span>
      </div>
      <article className="min-w-0 flex-1 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-teal-700 uppercase dark:text-teal-300">
              Field visit
            </p>
            <h3 className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base">
              Field visit
            </h3>
            {photos.length > 0 ? (
              <Badge variant="outline" className="mt-2">
                <ImageIcon />
                {photoCountLabel(photos.length)}
              </Badge>
            ) : null}
          </div>
          <time
            dateTime={visit.startDate}
            className="shrink-0 pt-0.5 text-xs text-muted-foreground sm:text-sm"
          >
            {formatVisitDate(visit.startDate)}
          </time>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Start
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{formatVisitDate(visit.startDate)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              End
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{formatVisitDate(visit.endDate)}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Observations</p>
          <p className="mt-1 text-sm leading-5 break-words">{visit.observations}</p>
        </div>
        {photosOpen && photos.length > 0 ? (
          <ul id={photosPanelId} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((url, index) => (
              <li key={url}>
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  aria-label={`View field visit photo ${index + 1}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <VisitImage
                    url={url}
                    alt={`Field visit photo ${index + 1}`}
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
        <VisitPhotoDialog
          photos={photos}
          index={viewerIndex}
          onIndexChange={setViewerIndex}
          onOpenChange={(open) => {
            if (!open) setViewerIndex(null);
          }}
        />
      </article>
    </li>
  );
}

export function FieldVisitsTab({ fieldId }: { fieldId: string }) {
  const visitsQuery = useFieldVisits(fieldId);
  const [visitOpen, setVisitOpen] = useState(false);
  const [editing, setEditing] = useState<FieldVisit | null>(null);
  const [deleting, setDeleting] = useState<FieldVisit | null>(null);
  const visits = useMemo(() => {
    return [...(visitsQuery.data ?? [])].sort(
      (a, b) => a.startDate.localeCompare(b.startDate) || a.createdAt.localeCompare(b.createdAt),
    );
  }, [visitsQuery.data]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Timeline</h2>
          {visitsQuery.isPending ? (
            <Skeleton className="mt-1.5 h-4 w-28" />
          ) : (
            <p className="text-sm text-muted-foreground">{visitCountLabel(visits.length)}</p>
          )}
        </div>
        <Button
          className="h-11 shrink-0 px-4 sm:h-9"
          onClick={() => {
            setEditing(null);
            setVisitOpen(true);
          }}
        >
          <Plus />
          Add visit
        </Button>
      </div>

      {visitsQuery.isPending ? <Skeleton className="h-36 w-full rounded-xl" /> : null}
      {visitsQuery.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load field visits.</p>
      ) : null}
      {visitsQuery.isSuccess && visits.length === 0 ? (
        <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
      ) : null}

      {visits.length > 0 ? (
        <ol className="relative flex flex-col gap-3">
          <span
            aria-hidden
            className="absolute top-6 bottom-6 left-4 border-l border-dashed border-border sm:left-5"
          />
          {visits.map((visit) => (
            <FieldVisitCard
              key={visit.id}
              visit={visit}
              onEdit={() => {
                setEditing(visit);
                setVisitOpen(true);
              }}
              onDelete={() => setDeleting(visit)}
            />
          ))}
        </ol>
      ) : null}

      <AddFieldVisitSheet
        fieldId={fieldId}
        visit={editing}
        open={visitOpen}
        onOpenChange={setVisitOpen}
      />
      <DeleteFieldVisitDialog
        visit={deleting}
        open={deleting != null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
