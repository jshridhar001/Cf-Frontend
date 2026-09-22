import { createFileRoute } from '@tanstack/react-router';
import { addressListQueryOptions } from '@/features/master/api/use-addresses';
import { AddressesTabContent } from '@/features/master/components/addresses/AddressesTabContent';
import {
  ADDRESS_LEVELS,
  type AddressLevel,
  addressSearchSchema,
} from '@/features/master/lib/address-levels';

export const Route = createFileRoute('/_authenticated/master/addresses')({
  validateSearch: addressSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(addressListQueryOptions('states'));
  },
  component: MasterAddressesPage,
});

function isAddressLevel(value: string): value is AddressLevel {
  return (ADDRESS_LEVELS as readonly string[]).includes(value);
}

function MasterAddressesPage() {
  const { create, tab, parentId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab = tab && isAddressLevel(tab) ? tab : 'states';

  return (
    <AddressesTabContent
      tab={activeTab}
      parentId={parentId}
      createOpen={Boolean(create)}
      onTabChange={(nextTab) => {
        void navigate({
          search: { tab: nextTab },
          replace: true,
        });
      }}
      onParentIdChange={(nextParentId) => {
        void navigate({
          search: (prev) => ({
            ...prev,
            parentId: nextParentId,
            create: prev.create ? true : undefined,
          }),
          replace: true,
        });
      }}
      onCreateOpenChange={(open) => {
        void navigate({
          search: (prev) => ({
            ...prev,
            tab: prev.tab ?? activeTab,
            parentId: prev.parentId,
            create: open ? true : undefined,
          }),
          replace: true,
        });
      }}
    />
  );
}
