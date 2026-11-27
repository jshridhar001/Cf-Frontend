import { useNavigate } from '@tanstack/react-router';
import {
  ClipboardList,
  MapPin,
  MapPinned,
  MoreHorizontal,
  Package,
  Phone,
  Sprout,
  SquarePen,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { DeleteFarmerDialog } from '@/features/farmers/overview/components/delete-farmer-dialog';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import {
  type Farmer,
  formatFarmerAccountType,
  getFarmerFamilyLabel,
} from '@/features/farmers/overview/types';
import { cn } from '@/lib/utils';

function farmerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return letters.join('') || '?';
}

function displayValue(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : '—';
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function FarmerActions({
  farmer,
  onEdit,
  onDelete,
}: {
  farmer: Farmer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-start gap-2 md:justify-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 md:min-h-8"
        onClick={onEdit}
      >
        <SquarePen data-icon="inline-start" />
        Edit
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 md:size-8 md:min-h-8 md:min-w-8"
            aria-label={`More actions for ${farmer.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function FarmerFacts({
  aadharNumber,
  panNumber,
  requisitions,
  approved,
}: {
  aadharNumber: string | null;
  panNumber: string | null;
  requisitions: number;
  approved: number;
}) {
  return (
    <PageCardContent className="space-y-6 md:space-y-8">
      <dl className="grid gap-5 sm:grid-cols-3 sm:gap-10">
        <DetailField label="Aadhaar number" value={displayValue(aadharNumber)} />
        <DetailField label="PAN number" value={displayValue(panNumber)} />
        <DetailField label="Contract" value="—" />
      </dl>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Package} label="Seed bags received" value="0" />
        <StatTile
          icon={ClipboardList}
          label="Seed requisitions"
          value={String(requisitions)}
          caption={`${approved} approved`}
        />
        <StatTile icon={Truck} label="Seed dispatches" value="0" caption="0 delivered" />
        <StatTile icon={Sprout} label="Fields planted" value="0" caption="0 acres" />
      </div>
    </PageCardContent>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-muted/50 px-4 py-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        <p className="text-sm leading-5">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 min-h-4 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

export function FarmerDetailsCard({ farmer }: { farmer: Farmer }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const station = farmer.station?.name?.trim() ?? '';
  const village = farmer.village?.name?.trim() ?? '';
  const familyLabel = getFarmerFamilyLabel(farmer);
  const accountType = formatFarmerAccountType(farmer.accountType);
  const requisitions = farmer.seedRequisitions.length;
  const approved = farmer.seedRequisitions.filter(
    (requisition) => requisition.status === 'APPROVED',
  ).length;

  return (
    <>
      <PageCard>
        <div className="md:hidden">
          <PageCardHeader className="gap-2">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                {farmerInitials(farmer.name)}
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-semibold tracking-tight text-balance">
                  {farmer.name}
                </h2>
                {station ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{station}</span>
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-sm"
                  aria-expanded={detailsOpen}
                  onClick={() => setDetailsOpen((open) => !open)}
                >
                  {detailsOpen ? 'View less' : 'View more'}
                </Button>
              </div>
            </div>
          </PageCardHeader>
          <div className={cn(detailsOpen ? 'block' : 'hidden')}>
            <PageCardContent className="space-y-5 pt-1 pb-5">
              <div className="space-y-3">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>Account #{farmer.accountNumber}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" aria-hidden />
                    {farmer.mobileNumber}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {village ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinned className="size-3.5 shrink-0" aria-hidden />
                      {village}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5 shrink-0" aria-hidden />
                    {familyLabel}
                  </span>
                  <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                    {accountType}
                  </Badge>
                </div>
              </div>
              <FarmerActions
                farmer={farmer}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              />
            </PageCardContent>
            <Separator />
            <div className="pt-5">
              <FarmerFacts
                aadharNumber={farmer.aadharNumber}
                panNumber={farmer.panNumber}
                requisitions={requisitions}
                approved={approved}
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <PageCardHeader className="pb-6">
            <div className="flex items-start justify-between gap-8">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary">
                  {farmerInitials(farmer.name)}
                </div>
                <div className="min-w-0 space-y-3 pt-0.5">
                  <div className="space-y-1">
                    <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
                      {farmer.name}
                    </h2>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <span>Account #{farmer.accountNumber}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5" aria-hidden />
                        {farmer.mobileNumber}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {station ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        {station}
                      </span>
                    ) : null}
                    {village ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinned className="size-3.5 shrink-0" aria-hidden />
                        {village}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5 shrink-0" aria-hidden />
                      {familyLabel}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-primary/25 bg-primary/10 text-primary"
                    >
                      {accountType}
                    </Badge>
                  </div>
                </div>
              </div>
              <FarmerActions
                farmer={farmer}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              />
            </div>
          </PageCardHeader>
          <Separator />
          <div className="pt-6">
            <FarmerFacts
              aadharNumber={farmer.aadharNumber}
              panNumber={farmer.panNumber}
              requisitions={requisitions}
              approved={approved}
            />
          </div>
        </div>
      </PageCard>
      <FarmerDrawer farmer={farmer} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteFarmerDialog
        farmer={farmer}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          void navigate({ to: '/farmers/overview' });
        }}
      />
    </>
  );
}
