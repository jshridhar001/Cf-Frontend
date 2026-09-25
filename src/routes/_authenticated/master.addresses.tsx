import { createFileRoute } from '@tanstack/react-router';
import { namedMastersQueryOptions } from '@/features/master/api/use-named-masters';
import { AddressesTabContent } from '@/features/master/components/addresses/AddressesTabContent';
import { addressMasterIds } from '@/features/master/lib/address-masters';

export const Route = createFileRoute('/_authenticated/master/addresses')({
  loader: ({ context }) => {
    for (const resourceId of addressMasterIds) {
      void context.queryClient.prefetchQuery(namedMastersQueryOptions(resourceId));
    }
  },
  component: MasterAddressesPage,
});

function MasterAddressesPage() {
  return <AddressesTabContent />;
}
