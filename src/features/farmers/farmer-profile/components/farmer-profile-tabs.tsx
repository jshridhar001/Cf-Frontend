import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { ClipboardList, Sprout, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Farmer } from '@/features/farmers/overview/types';

const tabs = [
  {
    label: 'Seed Requisitions',
    value: 'requisitions',
    to: '/farmers/$id/requisitions',
    icon: ClipboardList,
  },
  {
    label: 'Seed Dispatches',
    value: 'dispatches',
    to: '/farmers/$id/dispatches',
    icon: Truck,
  },
  {
    label: 'Seed & fields',
    value: 'fields',
    to: '/farmers/$id/fields',
    icon: Sprout,
  },
] as const;

type TabValue = (typeof tabs)[number]['value'];

export function FarmerProfileTabs({ farmer }: { farmer: Farmer }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeTab =
    tabs.find((tab) => {
      const href = `/farmers/${farmer.id}/${tab.value}`;
      return pathname === href || pathname === `${href}/` || pathname.startsWith(`${href}/`);
    })?.value ?? 'requisitions';

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const tab = tabs.find((item) => item.value === (value as TabValue));
        if (tab) {
          void navigate({ to: tab.to, params: { id: farmer.id } });
        }
      }}
      className="w-full"
    >
      <TabsList className="w-full justify-start overflow-x-auto md:overflow-visible">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              aria-label={tab.label}
              className="shrink-0 md:flex-1"
            >
              <Icon className="md:hidden" aria-hidden />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      <TabsContent value={activeTab}>
        <Outlet />
      </TabsContent>
    </Tabs>
  );
}
