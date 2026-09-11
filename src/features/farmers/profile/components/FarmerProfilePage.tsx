import { useNavigate, useRouter } from '@tanstack/react-router';
import {
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  EllipsisVertical,
  FileText,
  Flag,
  PlusIcon,
  SquarePenIcon,
  Trash2Icon,
  Truck,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardFooter, PageCardHeader } from '@/components/page-card';
import { PageTabsList, PageTabsTrigger } from '@/components/page-tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ContractDrawer } from '@/features/farmers/contract/components/contract-drawer';
import { DeleteContractDialog } from '@/features/farmers/contract/components/delete-contract-dialog';
import { FarmerContractsList } from '@/features/farmers/contract/components/farmer-contracts-list';
import { type FarmerContractRow, flattenFarmerContracts } from '@/features/farmers/contract/types';
import { DeleteFarmerDialog } from '@/features/farmers/overview/components/delete-farmer-dialog';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import {
  type Farmer,
  formatFarmerAccountType,
  formatFarmerStatus,
  getFarmerLocalityName,
  getFarmerStationName,
} from '@/features/farmers/overview/types';
import { useFarmer } from '@/features/farmers/profile/api/use-farmer';
import {
  type FarmerProfileTab,
  farmerProfileTabItems,
} from '@/features/farmers/profile/lib/farmer-profile-tabs';
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

function ProfileFields({ fields }: { fields: { label: string; value: string }[] }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="md:hidden">
        <CollapsibleContent>
          <ItemGroup className="mb-2 gap-4 has-data-[size=sm]:gap-4">
            {fields.map((field) => (
              <Item key={field.label} variant="muted" size="sm">
                <ItemContent>
                  <ItemDescription>{field.label}</ItemDescription>
                  <ItemTitle className="line-clamp-none w-full wrap-break-word">
                    {field.value}
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </CollapsibleContent>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="min-h-11 w-full">
            {detailsOpen ? (
              <ChevronUp data-icon="inline-start" />
            ) : (
              <ChevronDown data-icon="inline-start" />
            )}
            {detailsOpen ? 'View less' : 'View more'}
          </Button>
        </CollapsibleTrigger>
      </Collapsible>
      <dl className="hidden md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {fields.map((field) => (
          <ProfileField key={field.label} label={field.label} value={field.value} />
        ))}
      </dl>
    </>
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
    <Item variant="muted" className="min-w-0 flex-nowrap items-start md:px-4 md:py-4">
      <ItemMedia variant="icon">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary md:size-9">
          <Icon className="size-4" aria-hidden />
        </div>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemDescription className="line-clamp-2 text-xs leading-tight font-medium tracking-wide uppercase">
          {label}
        </ItemDescription>
        <ItemTitle>{value}</ItemTitle>
        <p className="hidden text-xs text-muted-foreground md:block">{hint}</p>
      </ItemContent>
    </Item>
  );
}

function FarmerProfileMeta({
  placeLabel,
  familyName,
  accountType,
  status,
}: {
  placeLabel: string;
  familyName: string | null | undefined;
  accountType: Farmer['accountType'];
  status: Farmer['status'];
}) {
  const contextLabel = [placeLabel, familyName].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-wrap items-center gap-2">
      {contextLabel ? <span className="text-sm text-muted-foreground">{contextLabel}</span> : null}
      <Badge variant="outline">{formatFarmerAccountType(accountType)}</Badge>
      <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
        {formatFarmerStatus(status)}
      </Badge>
    </div>
  );
}

function FarmerMoreMenu({
  farmerName,
  onDelete,
  triggerClassName,
}: {
  farmerName: string;
  onDelete: () => void;
  triggerClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={triggerClassName}
          aria-label={`More actions for ${farmerName}`}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FarmerProfileMobileHeader({
  farmer,
  placeLabel,
  familyName,
  onEdit,
  onDelete,
}: {
  farmer: Farmer;
  placeLabel: string;
  familyName: string | null | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Item size="sm" className="w-full items-start px-0 py-0 md:hidden">
      <ItemHeader className="gap-3">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {getInitials(farmer.name)}
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent className="min-w-0 pr-1">
          <ItemTitle className="line-clamp-none text-base font-semibold">{farmer.name}</ItemTitle>
          <ItemDescription>Account #{farmer.accountNumber}</ItemDescription>
          {farmer.mobileNumber ? (
            <ItemDescription className="line-clamp-1">{farmer.mobileNumber}</ItemDescription>
          ) : null}
        </ItemContent>
        <ItemActions className="shrink-0 self-start gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Edit ${farmer.name}`}
            onClick={onEdit}
          >
            <SquarePenIcon />
          </Button>
          <FarmerMoreMenu
            farmerName={farmer.name}
            onDelete={onDelete}
            triggerClassName="min-h-11 min-w-11"
          />
        </ItemActions>
      </ItemHeader>
      <ItemFooter className="mt-2 flex-wrap items-center justify-start gap-2 border-t border-border/60 pt-2.5">
        <FarmerProfileMeta
          placeLabel={placeLabel}
          familyName={familyName}
          accountType={farmer.accountType}
          status={farmer.status}
        />
      </ItemFooter>
    </Item>
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
      <PageCard className="gap-5 sm:gap-5 md:gap-6">
        <PageCardHeader>
          <div className="flex items-start gap-3 md:hidden">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-lg" />
              <Skeleton className="h-4 w-28 rounded-lg" />
            </div>
            <Skeleton className="size-11 rounded-lg" />
          </div>
          <div className="hidden items-start gap-3 md:flex">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </PageCardHeader>
        <PageCardContent>
          <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading farmer">
            <Skeleton className="h-11 w-full rounded-lg md:hidden" />
            <div className="hidden md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {['aadhaar', 'pan', 'bank', 'ifsc', 'account'].map((field) => (
                <div key={field} className="flex min-w-0 flex-col gap-1">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-full max-w-xs rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </PageCardContent>
        <PageCardFooter className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {['bags', 'reqs', 'dispatches', 'fields'].map((stat) => (
            <Skeleton key={stat} className="h-18 rounded-2xl md:h-20" />
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
            <Empty className="border-0 p-8 sm:p-12 sm:py-16">
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
  const [createContractOpen, setCreateContractOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<FarmerContractRow | null>(null);
  const [deletingContract, setDeletingContract] = useState<FarmerContractRow | null>(null);
  const contracts = useMemo(() => flattenFarmerContracts([farmer]), [farmer]);
  const contractTab = farmerProfileTabItems.find((item) => item.value === 'contract');
  const profileFields = [
    { label: 'Aadhaar number', value: displayValue(farmer.aadharNumber) },
    { label: 'PAN number', value: displayValue(farmer.panNumber) },
    { label: 'Bank name', value: displayValue(farmer.bankName) },
    { label: 'IFSC code', value: displayValue(farmer.ifscCode) },
    { label: 'Bank account number', value: displayValue(farmer.bankAccountNumber) },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <BackButton onBack={onBack} />

      <PageCard className="gap-5 sm:gap-5 md:gap-6">
        <PageCardHeader className="has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <FarmerProfileMobileHeader
            farmer={farmer}
            placeLabel={placeLabel}
            familyName={familyName}
            onEdit={() => onEditOpenChange(true)}
            onDelete={() => onDeleteOpenChange(true)}
          />
          <div className="hidden min-w-0 items-start gap-3 md:flex">
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
              <div className="mt-2">
                <FarmerProfileMeta
                  placeLabel={placeLabel}
                  familyName={familyName}
                  accountType={farmer.accountType}
                  status={farmer.status}
                />
              </div>
            </div>
          </div>
          <CardAction className="hidden items-center gap-1 md:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEditOpenChange(true)}
            >
              <SquarePenIcon data-icon="inline-start" />
              Edit
            </Button>
            <FarmerMoreMenu
              farmerName={farmer.name}
              onDelete={() => onDeleteOpenChange(true)}
              triggerClassName="size-8 min-h-8 min-w-8"
            />
          </CardAction>
        </PageCardHeader>

        <PageCardContent>
          <ProfileFields fields={profileFields} />
        </PageCardContent>

        <PageCardFooter className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Seed bags received" value="0" hint="approved" icon={Box} />
          <StatTile label="Seed requisitions" value="0" hint="approved" icon={FileText} />
          <StatTile label="Seed dispatches" value="0" hint="delivered" icon={Truck} />
          <StatTile label="Seed and fields" value="0" hint="acres" icon={Flag} />
        </PageCardFooter>
      </PageCard>

      <Tabs value={tab} onValueChange={onTabChange} className="w-full min-w-0">
        <PageTabsList className="min-h-11 sm:w-fit md:min-h-9">
          {farmerProfileTabItems.map((item) => (
            <PageTabsTrigger key={item.value} value={item.value} className="px-2.5 sm:px-3">
              <span className="sm:hidden">{item.shortLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </PageTabsTrigger>
          ))}
        </PageTabsList>
        {farmerProfileTabItems.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            {item.value === 'contract' ? (
              <PageCard>
                <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
                  <CardTitle>Farmer Contract</CardTitle>
                  <CardDescription className="hidden sm:block">
                    Create, update, and delete contracts for this farmer.
                  </CardDescription>
                  <CardAction className="flex items-center gap-1 md:hidden">
                    <Button
                      type="button"
                      size="icon"
                      className="min-h-11 min-w-11"
                      aria-label="Add contract"
                      onClick={() => setCreateContractOpen(true)}
                    >
                      <PlusIcon />
                    </Button>
                  </CardAction>
                </PageCardHeader>
                <PageCardContent>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="hidden items-center justify-end md:flex">
                      <Button type="button" size="sm" onClick={() => setCreateContractOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Add contract
                      </Button>
                    </div>
                    <FarmerContractsList
                      contracts={contracts}
                      emptyTitle={contractTab?.emptyTitle ?? 'No contracts yet'}
                      emptyDescription={
                        contractTab?.emptyDescription ??
                        'Contracts for this farmer will appear here.'
                      }
                      onEdit={setEditingContract}
                      onDelete={setDeletingContract}
                    />
                  </div>
                </PageCardContent>
              </PageCard>
            ) : (
              <Empty className="border border-dashed p-6 sm:p-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>{item.emptyTitle}</EmptyTitle>
                  <EmptyDescription>{item.emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
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
      <ContractDrawer
        farmers={[farmer]}
        contract={editingContract}
        open={createContractOpen || editingContract !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateContractOpen(false);
            setEditingContract(null);
          }
        }}
      />
      <DeleteContractDialog
        contract={deletingContract}
        open={deletingContract !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingContract(null);
        }}
      />
    </div>
  );
}
