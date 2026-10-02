import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { PageCard, PageCardContent } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmer } from '@/features/farmers/farmer-profile/api/use-farmer';
import { FarmerDetailsCard } from '@/features/farmers/farmer-profile/components/farmer-details-card';
import { FarmerProfileTabs } from '@/features/farmers/farmer-profile/components/farmer-profile-tabs';

function BackToFarmers() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
      asChild
    >
      <Link to="/farmers/overview">
        <ArrowLeft className="size-4" />
        Back to farmers
      </Link>
    </Button>
  );
}

function FarmerProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-full sm:w-96" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}

export function FarmerProfilePage({ id }: { id: string }) {
  const { data: farmer, isPending, isError } = useFarmer(id);
  const missing = !isPending && (isError || !farmer);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <BackToFarmers />
      {isPending ? <FarmerProfileSkeleton /> : null}
      {missing ? (
        <PageCard>
          <PageCardContent>
            <p className="text-sm text-muted-foreground">This farmer could not be found.</p>
          </PageCardContent>
        </PageCard>
      ) : null}
      {farmer ? (
        <>
          <FarmerDetailsCard farmer={farmer} />
          <FarmerProfileTabs farmer={farmer} />
        </>
      ) : null}
    </div>
  );
}
