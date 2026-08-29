import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { canAccessAdminRoutes } from '@/features/auth/lib/authorization';

export const Route = createFileRoute('/_authenticated/master')({
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());

    if (!canAccessAdminRoutes(me?.user.role)) {
      throw redirect({ to: '/dashboard' });
    }

    if (location.pathname === '/master' || location.pathname === '/master/') {
      throw redirect({ to: '/master/stations' });
    }
  },
  component: MasterLayout,
});

const tabs = [
  { label: 'Stations', value: 'stations', to: '/master/stations' },
  { label: 'Varieties', value: 'varieties', to: '/master/varieties' },
  { label: 'Facilities', value: 'facilities', to: '/master/facilities' },
  { label: 'Seed Sizes', value: 'seed-sizes', to: '/master/seed-sizes' },
  { label: 'Generations', value: 'generations', to: '/master/generations' },
  { label: 'Tuber Sizes', value: 'tuber-sizes', to: '/master/tuber-sizes' },
] as const;

type TabValue = (typeof tabs)[number]['value'];

function MasterLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeTab =
    tabs.find((tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`))?.value ??
    'stations';

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const tab = tabs.find((t) => t.value === (value as TabValue));
        if (tab) {
          void navigate({ to: tab.to });
        }
      }}
      className="w-full"
    >
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab}>
        <Outlet />
      </TabsContent>
    </Tabs>
  );
}
