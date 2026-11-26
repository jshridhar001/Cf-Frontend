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
  User,
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
import { FarmerConfirmationAction } from '@/features/farmers/farmer-profile/components/farmer-confirmation-action';
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
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function FarmerBadges({
  station,
  village,
  familyLabel,
  accountType,
}: {
  station: string;
  village: string;
  familyLabel: string;
  accountType: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {station ? (
        <Badge variant="secondary">
          <MapPin aria-hidden />
          {station}
        </Badge>
      ) : null}
      {village ? (
        <Badge variant="secondary">
          <MapPinned aria-hidden />
          {village}
        </Badge>
      ) : null}
      <Badge variant="secondary">
        <Users aria-hidden />
        {familyLabel}
      </Badge>
      <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
        <User aria-hidden />
        {accountType}
      </Badge>
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
    <div className="flex shrink-0 flex-wrap items-start justify-end gap-2">
      <FarmerConfirmationAction farmerId={farmer.id} farmerName={farmer.name} />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11 md:hidden"
          aria-label={`Edit ${farmer.name}`}
          onClick={onEdit}
        >
          <SquarePen />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden md:inline-flex"
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
    <>
      <PageCardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          <DetailField label="Aadhaar number" value={displayValue(aadharNumber)} />
          <DetailField label="PAN number" value={displayValue(panNumber)} />
          <DetailField label="Contract" value="—" />
        </dl>
      </PageCardContent>
      <PageCardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
    </>
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
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/60 px-3 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-xl font-semibold tracking-tight tabular-nums">{value}</span>
          {caption ? <span className="text-xs text-muted-foreground">{caption}</span> : null}
        </p>
      </div>
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
            <Separator />
            <PageCardContent className="space-y-3">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>Account #{farmer.accountNumber}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3.5" aria-hidden />
                  {farmer.mobileNumber}
                </span>
              </p>
              <FarmerBadges
                station=""
                village={village}
                familyLabel={familyLabel}
                accountType={accountType}
              />
              <FarmerActions
                farmer={farmer}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              />
            </PageCardContent>
            <Separator />
            <FarmerFacts
              aadharNumber={farmer.aadharNumber}
              panNumber={farmer.panNumber}
              requisitions={requisitions}
              approved={approved}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <PageCardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {farmerInitials(farmer.name)}
                </div>
                <div className="min-w-0 space-y-2">
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-balance sm:text-xl">
                    {farmer.name}
                  </h2>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span>Account #{farmer.accountNumber}</span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" aria-hidden />
                      {farmer.mobileNumber}
                    </span>
                  </p>
                  <FarmerBadges
                    station={station}
                    village={village}
                    familyLabel={familyLabel}
                    accountType={accountType}
                  />
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
          <FarmerFacts
            aadharNumber={farmer.aadharNumber}
            panNumber={farmer.panNumber}
            requisitions={requisitions}
            approved={approved}
          />
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
