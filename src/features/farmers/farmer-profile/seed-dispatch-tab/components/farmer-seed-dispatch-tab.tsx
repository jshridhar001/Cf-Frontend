import { useState } from 'react';
import type { Farmer } from '@/features/farmers/overview/types';
import { SeedDispatchList } from '@/features/seed-dispatch/overview/components/SeedDispatchOverviewPage';
import type { SeedDispatchSearch } from '@/features/seed-dispatch/overview/lib/search';
import type { SeedDispatchStatus } from '@/features/seed-dispatch/overview/types';

export function FarmerSeedDispatchTab({ farmer }: { farmer: Farmer }) {
  const [status, setStatus] = useState<SeedDispatchStatus | undefined>();
  const search: SeedDispatchSearch = { status };

  return (
    <SeedDispatchList
      search={search}
      lockedFarmerId={farmer.id}
      onSearchChange={(updater) => {
        setStatus(updater(search).status);
      }}
    />
  );
}
