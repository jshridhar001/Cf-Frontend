import { useNavigate, useRouter } from '@tanstack/react-router';
import {
  Box,
  ChevronLeft,
  EllipsisVertical,
  FileText,
  Flag,
  SquarePenIcon,
  Trash2Icon,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import {
  PageCard,
  PageCardContent,
  PageCardFooter,
  PageCardHeader,
} from '@/components/page-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Skeleton } from '@/components/ui/skeleton';
import { PageTabsList, PageTabsTrigger } from '@/components/page-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  type FarmerProfileTab,
  farmerProfileTabItems,
} from '@/features/farmer-profile/farmer-profile-tabs';
import { useFarmer } from '@/features/farmers/api/use-farmer';
import { DeleteFarmerDialog } from '@/features/farmers/overview/components/delete-farmer-dialog';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import {
  type Farmer,
  formatFarmerAccountType,
  formatFarmerStatus,
  getFarmerLocalityName,
  getFarmerStationName,
} from '@/features/farmers/types';
import { getApiErrorMessage, getHttpStatusFromError } from '@/lib/api-client';

function displayValue(value: string | null | undefined) {
  if (!value) return '—';
  return value;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function canGoBack(history: { canGoBack?: () => boolean; length: number }) {
  if (typeof history.canGoBack === 'function') {
    return history.canGoBack();
  }
  return history.length > 1;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium wrap-break-word">{value}</dd>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Box;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-muted/60 p-3 sm:p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto min-h-11 w-fit justify-start gap-1 px-2"
      onClick={onBack}
    >
      <ChevronLeft className="size-4" />
      Back
    </Button>
  );
}

function FarmerProfileSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-11 w-20 rounded-lg" />
      <PageCard>
        <PageCardHeader>
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
            <Skeleton className="size-11 rounded-lg md:h-9 md:w-20" />
          </div>
        </PageCardHeader>
        <PageCardContent>
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading farmer"
          >
            {['aadhaar', 'pan', 'bank', 'ifsc', 'account'].map((field) => (
              <div key={field} className="flex min-w-0 flex-col gap-1">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-4 w-full max-w-xs rounded-lg" />
              </div>
            ))}
          </div>
        </PageCardContent>
        <PageCardFooter className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['bags', 'reqs', 'dispatches', 'fields'].map((stat) => (
            <Skeleton key={stat} className="h-20 rounded-2xl" />
          ))}
        </PageCardFooter>
      </PageCard>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}

export default function FarmerProfilePage({ id, tab }: { id: string; tab: FarmerProfileTab }) {
  const router = useRouter();
  const navigate = useNavigate();
  const { data: farmer, isPending, isError, error } = useFarmer(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const notFound = isError && getHttpStatusFromError(error) === 404;

  const handleBack = () => {
    if (canGoBack(router.history)) {
      router.history.back();
      return;
    }
    void navigate({ to: '/farmers/overview' });
  };

  const handleTabChange = (value: string) => {
    void navigate({
      to: '/farmers/$id',
      params: { id },
      search: { tab: value as FarmerProfileTab },
      replace: true,
    });
  };

  if (isPending && farmer === undefined) {
    return <FarmerProfileSkeleton />;
  }

  if (notFound || (!isPending && !farmer && !isError)) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <BackButton onBack={handleBack} />
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
                <Button type="button" onClick={handleBack}>
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
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <BackButton onBack={handleBack} />
        <PageCard>
          <PageCardContent>
            <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          </PageCardContent>
        </PageCard>
      </div>
    );
  }

  return (
    <FarmerProfileLoaded
      farmer={farmer}
      tab={tab}
      onBack={handleBack}
      onTabChange={handleTabChange}
      editOpen={editOpen}
      onEditOpenChange={setEditOpen}
      deleteOpen={deleteOpen}
      onDeleteOpenChange={setDeleteOpen}
      onDeleted={() => {
        void navigate({ to: '/farmers/overview' });
      }}
    />
  );
}

function FarmerProfileLoaded({
  farmer,
  tab,
  onBack,
  onTabChange,
  editOpen,
  onEditOpenChange,
  deleteOpen,
  onDeleteOpenChange,
  onDeleted,
}: {
  farmer: Farmer;
  tab: FarmerProfileTab;
  onBack: () => void;
  onTabChange: (value: string) => void;
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const locality = getFarmerLocalityName(farmer);
  const station = getFarmerStationName(farmer);
  const placeLabel = [locality, station].filter(Boolean).join(' ');
  const familyName = farmer.family?.name ?? farmer.familyName;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <BackButton onBack={onBack} />

      <PageCard>
        <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {getInitials(farmer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold">{farmer.name}</CardTitle>
              <CardDescription>
                Account #{farmer.accountNumber}
                {farmer.mobileNumber ? ` · ${farmer.mobileNumber}` : null}
              </CardDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {placeLabel ? (
                  <span className="text-sm text-muted-foreground">{placeLabel}</span>
                ) : null}
                {familyName ? (
                  <span className="text-sm text-muted-foreground">{familyName}</span>
                ) : null}
                <Badge variant="outline">{formatFarmerAccountType(farmer.accountType)}</Badge>
                <Badge variant={farmer.status === 'ACTIVE' ? 'default' : 'secondary'}>
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
              onClick={() => onEditOpenChange(true)}
            >
              <SquarePenIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => onEditOpenChange(true)}
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
                  className="min-h-11 min-w-11 md:size-8 md:min-h-8 md:min-w-8"
                  aria-label={`More actions for ${farmer.name}`}
                >
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={() => onDeleteOpenChange(true)}>
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </PageCardHeader>

        <PageCardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileField label="Aadhaar number" value={displayValue(farmer.aadharNumber)} />
            <ProfileField label="PAN number" value={displayValue(farmer.panNumber)} />
            <ProfileField label="Bank name" value={displayValue(farmer.bankName)} />
            <ProfileField label="IFSC code" value={displayValue(farmer.ifscCode)} />
            <ProfileField
              label="Bank account number"
              value={displayValue(farmer.bankAccountNumber)}
            />
          </dl>
        </PageCardContent>

        <PageCardFooter className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Seed bags received" value="0" hint="approved" icon={Box} />
          <StatTile label="Seed requisitions" value="0" hint="approved" icon={FileText} />
          <StatTile label="Seed dispatches" value="0" hint="delivered" icon={Truck} />
          <StatTile label="Seed and fields" value="0" hint="acres" icon={Flag} />
        </PageCardFooter>
      </PageCard>

      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <PageTabsList>
          {farmerProfileTabItems.map((item) => (
            <PageTabsTrigger key={item.value} value={item.value}>
              {item.label}
            </PageTabsTrigger>
          ))}
        </PageTabsList>
        {farmerProfileTabItems.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <Empty className="border border-dashed py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>{item.emptyTitle}</EmptyTitle>
                <EmptyDescription>{item.emptyDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>
        ))}
      </Tabs>

      <FarmerDrawer farmer={farmer} open={editOpen} onOpenChange={onEditOpenChange} />
      <DeleteFarmerDialog
        farmer={farmer}
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        onDeleted={onDeleted}
      />
    </div>
  );
}
