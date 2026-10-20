import { format } from 'date-fns';
import {
  Droplet,
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
import { Button } from '@/components/ui/button';
import { parseDateOnlyString } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useFieldPlantations } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field-plantations';
import { AddPlantationSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/add-plantation-sheet';
import { DeletePlantationDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/delete-plantation-dialog';
import type { Plantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';

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

function PlantationCard({
  plantation,
  onEdit,
  onDelete,
}: {
  plantation: Plantation;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        <div className="mt-4 flex justify-end gap-2">
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

export function FieldActivitiesTab({
  fieldId,
  fieldAcres,
}: {
  fieldId: string;
  fieldAcres: string;
}) {
  const { data: plantations, isPending, isError } = useFieldPlantations(fieldId);
  const [plantationOpen, setPlantationOpen] = useState(false);
  const [editing, setEditing] = useState<Plantation | null>(null);
  const [deleting, setDeleting] = useState<Plantation | null>(null);
  const steps = useMemo(
    () =>
      [...(plantations ?? [])].sort(
        (a, b) => a.startDate.localeCompare(b.startDate) || a.createdAt.localeCompare(b.createdAt),
      ),
    [plantations],
  );

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
                  if (step.id !== 'plantation') return;
                  setEditing(null);
                  setPlantationOpen(true);
                }}
              >
                <step.icon />
                {step.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isPending ? <Skeleton className="h-36 w-full rounded-xl" /> : null}
      {isError ? <p className="text-sm text-muted-foreground">Couldn't load plantations.</p> : null}
      {!isPending && !isError && steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No steps recorded yet.</p>
      ) : null}

      {steps.length > 0 ? (
        <ol className="relative flex flex-col gap-3">
          <span
            aria-hidden
            className="absolute top-6 bottom-6 left-4 border-l border-dashed border-border sm:left-5"
          />
          {steps.map((plantation) => (
            <PlantationCard
              key={plantation.id}
              plantation={plantation}
              onEdit={() => {
                setEditing(plantation);
                setPlantationOpen(true);
              }}
              onDelete={() => setDeleting(plantation)}
            />
          ))}
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
    </div>
  );
}
