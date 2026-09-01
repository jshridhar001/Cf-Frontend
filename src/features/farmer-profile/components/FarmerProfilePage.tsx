import { useCanGoBack, useRouter } from '@tanstack/react-router';
import {
  ArrowLeft,
  FileText,
  LandPlot,
  MapPin,
  MoreHorizontalIcon,
  Package,
  Phone,
  SquarePenIcon,
  Trash2Icon,
  Truck,
  User,
  Users,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardAction, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFarmer } from '@/features/farmers/api/use-farmer';
import { DeleteFarmerDialog } from '@/features/farmers/overview/components/delete-farmer-dialog';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import { type Farmer, formatFarmerAccountType, formatFarmerStatus } from '@/features/farmers/types';
import { getApiErrorMessage, getHttpStatusFromError } from '@/lib/api-client';
import { FarmerProfileContracts } from './farmer-profile-contracts';

const PROFILE_TABS = [
  { value: 'contract', label: 'Farmer Contract' },
  { value: 'requisitions', label: 'Seed Requisitions' },
  { value: 'dispatches', label: 'Seed Dispatches' },
  { value: 'fields', label: 'Seed & fields' },
] as const;

function displayValue(value: string | null | undefined) {
  if (!value) return '—';
  return value;
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function useGoBack() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return () => {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/farmers/overview' });
  };
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto min-h-11 w-fit gap-2 px-2 text-muted-foreground md:min-h-8"
      onClick={onClick}
    >
      <ArrowLeft />
      Back
    </Button>
  );
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold wrap-break-word">{value}</dd>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-muted/50 px-3 py-3 sm:px-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 truncate">
          <span className="text-lg font-semibold tracking-tight">{value}</span>{' '}
          <span className="text-sm text-muted-foreground">{hint}</span>
        </p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Skeleton className="h-11 w-24 rounded-4xl md:h-8" />
      <PageCard>
        <PageCardHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="size-14 shrink-0 rounded-2xl sm:size-16" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-7 w-48 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-5 w-64 max-w-full" />
            </div>
          </div>
        </PageCardHeader>
        <PageCardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </PageCardContent>
      </PageCard>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}

function FarmerIdentityCard({
  farmer,
  onEdit,
  onDelete,
}: {
  farmer: Farmer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const familyLabel = farmer.family?.name ?? farmer.familyName;
  const station = farmer.station?.name;
  const locality = farmer.locality?.name;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Avatar size="lg" className="size-14 rounded-2xl after:rounded-2xl sm:size-16">
            <AvatarFallback className="rounded-2xl bg-primary/10 font-semibold text-primary">
              {getInitials(farmer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pr-2">
            <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {farmer.name}
            </CardTitle>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>Account #{farmer.accountNumber}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0" aria-hidden />
                {farmer.mobileNumber}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {station ? (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  {station}
                </span>
              ) : null}
              {locality ? <span className="text-sm text-muted-foreground">{locality}</span> : null}
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3.5 shrink-0" aria-hidden />
                {familyLabel || 'Independent'}
              </span>
              <Badge variant="secondary">{formatFarmerAccountType(farmer.accountType)}</Badge>
              <Badge variant={farmer.status === 'ACTIVE' ? 'default' : 'outline'}>
                {formatFarmerStatus(farmer.status)}
              </Badge>
            </div>
          </div>
        </div>
        <CardAction className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 md:hidden"
            aria-label={`Edit ${farmer.name}`}
            onClick={onEdit}
          >
            <SquarePenIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="hidden md:inline-flex"
            onClick={onEdit}
          >
            <SquarePenIcon data-icon="inline-start" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="min-h-11 min-w-11 md:size-9 md:min-h-9 md:min-w-9"
                aria-label="More actions"
              >
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuLabel className="font-semibold tracking-wide text-muted-foreground uppercase">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </PageCardHeader>
      <PageCardContent className="flex flex-col gap-6">
        <Separator />
        <dl className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <DetailField label="Aadhaar number" value={displayValue(farmer.aadharNumber)} />
          <DetailField label="PAN number" value={displayValue(farmer.panNumber)} />
          <DetailField label="Bank name" value={displayValue(farmer.bankName)} />
          <DetailField label="IFSC code" value={displayValue(farmer.ifscCode)} />
          <DetailField label="Bank account number" value={displayValue(farmer.bankAccountNumber)} />
        </dl>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Package} label="Seed bags received" value="0" hint="0 approved" />
          <StatTile icon={FileText} label="Seed requisitions" value="0" hint="0 approved" />
          <StatTile icon={Truck} label="Seed dispatches" value="0" hint="0 delivered" />
          <StatTile icon={LandPlot} label="Seed and Fields" value="0" hint="acres" />
        </div>
      </PageCardContent>
    </PageCard>
  );
}

export default function FarmerProfilePage({ id }: { id: string }) {
  const { data: farmer, isPending, isError, error } = useFarmer(id);
  const goBack = useGoBack();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const notFound = isError && getHttpStatusFromError(error) === 404;

  if (isPending && farmer === undefined) {
    return <ProfileSkeleton />;
  }

  if (notFound || (!isPending && !farmer && !isError)) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <BackButton onClick={goBack} />
        <PageCard>
          <PageCardContent>
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <User />
                </EmptyMedia>
                <EmptyTitle>Farmer not found</EmptyTitle>
                <EmptyDescription>No farmer exists for this id.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" onClick={goBack}>
                  Back
                </Button>
              </EmptyContent>
            </Empty>
          </PageCardContent>
        </PageCard>
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <BackButton onClick={goBack} />
        <PageCard>
          <PageCardContent>
            <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          </PageCardContent>
        </PageCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <BackButton onClick={goBack} />
      <FarmerIdentityCard
        farmer={farmer}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />
      <Tabs defaultValue="contract" className="w-full gap-4">
        <TabsList className="h-11 w-full justify-start overflow-x-auto md:h-10 md:overflow-visible">
          {PROFILE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0 md:flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {PROFILE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="pt-2">
            {tab.value === 'contract' ? (
              <FarmerProfileContracts farmer={farmer} />
            ) : (
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{tab.label}</h4>
            )}
          </TabsContent>
        ))}
      </Tabs>
      <FarmerDrawer farmer={farmer} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteFarmerDialog
        farmer={deleteOpen ? farmer : null}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={goBack}
      />
    </div>
  );
}
