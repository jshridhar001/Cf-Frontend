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

export const Route = createFileRoute('/_authenticated/access-control')({
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());

    if (!canAccessAdminRoutes(me?.user.role)) {
      throw redirect({ to: '/403' });
    }

    if (location.pathname === '/access-control' || location.pathname === '/access-control/') {
      throw redirect({ to: '/access-control/users' });
    }
  },
  component: AccessControlLayout,
});

const tabs = [
  { label: 'Users', value: 'users', to: '/access-control/users' },
  { label: 'Permissions', value: 'permissions', to: '/access-control/permissions' },
  { label: 'Sessions', value: 'sessions', to: '/access-control/sessions' },
] as const;

type TabValue = (typeof tabs)[number]['value'];

function AccessControlLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeTab =
    tabs.find((tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`))?.value ?? 'users';

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
      <TabsList className="w-full sm:w-fit">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
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
