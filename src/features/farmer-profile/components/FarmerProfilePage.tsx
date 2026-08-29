import { Link } from '@tanstack/react-router';
import { ArrowLeft, User } from 'lucide-react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useFarmer } from '@/features/farmers/api/use-farmer';
import { type Farmer, formatFarmerAccountType, formatFarmerStatus } from '@/features/farmers/types';
import { getApiErrorMessage, getHttpStatusFromError } from '@/lib/api-client';

function displayValue(value: string | null | undefined) {
  if (!value) return '—';
  return value;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:grid sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{value}</dd>
    </div>
  );
}

function FarmerProfileFields({ farmer }: { farmer: Farmer }) {
  return (
    <dl className="flex flex-col gap-4">
      <ProfileField label="Name" value={farmer.name} />
      <ProfileField label="Account" value={farmer.accountNumber} />
      <ProfileField label="Mobile" value={farmer.mobileNumber} />
      <ProfileField label="Account type" value={formatFarmerAccountType(farmer.accountType)} />
      <ProfileField label="Family" value={displayValue(farmer.family?.name ?? farmer.familyName)} />
      <ProfileField
        label="Family account"
        value={displayValue(farmer.family?.accountNumber ?? farmer.familyAccountNumber)}
      />
      <ProfileField label="Station" value={displayValue(farmer.station?.name)} />
      <ProfileField label="Locality" value={displayValue(farmer.locality?.name)} />
      <ProfileField label="Status" value={formatFarmerStatus(farmer.status)} />
      <ProfileField label="Aadhaar" value={displayValue(farmer.aadharNumber)} />
      <ProfileField label="PAN" value={displayValue(farmer.panNumber)} />
      <ProfileField label="Contract URL" value={displayValue(farmer.contractUrl)} />
      <ProfileField label="Bank name" value={displayValue(farmer.bankName)} />
      <ProfileField label="IFSC code" value={displayValue(farmer.ifscCode)} />
      <ProfileField label="Bank account number" value={displayValue(farmer.bankAccountNumber)} />
    </dl>
  );
}

export default function FarmerProfilePage({ id }: { id: string }) {
  const { data: farmer, isPending, isError, error } = useFarmer(id);
  const notFound = isError && getHttpStatusFromError(error) === 404;

  if (isPending && farmer === undefined) {
    return (
      <PageCard>
        <PageCardContent>
          <p className="text-sm text-muted-foreground">Loading farmer…</p>
        </PageCardContent>
      </PageCard>
    );
  }

  if (notFound || (!isPending && !farmer && !isError)) {
    return (
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
              <Button asChild>
                <Link to="/farmers/overview">Back to overview</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </PageCardContent>
      </PageCard>
    );
  }

  if (isError || !farmer) {
    return (
      <PageCard>
        <PageCardContent>
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        </PageCardContent>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <PageCardHeader>
        <div className="flex items-start gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 min-h-11 min-w-11 shrink-0 md:min-h-8 md:min-w-8"
          >
            <Link to="/farmers/overview" aria-label="Back to overview">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <CardTitle>{farmer.name}</CardTitle>
            <CardDescription>Account {farmer.accountNumber}</CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={farmer.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {formatFarmerStatus(farmer.status)}
            </Badge>
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </PageCardHeader>
      <PageCardContent>
        <FarmerProfileFields farmer={farmer} />
      </PageCardContent>
    </PageCard>
  );
}
