import { Link, useRouterState } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Bell,
  ChevronRight,
  ClipboardList,
  Database,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Truck,
  User,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useMe } from '@/features/auth/api/use-me';
import { canAccessAdminRoutes } from '@/features/auth/lib/authorization';
import { env } from '@/lib/env';

type AppPath =
  | '/dashboard'
  | '/farmers'
  | '/messages'
  | '/notifications'
  | '/seed-requisition/overview'
  | '/seed-requisition/analytics'
  | '/seed-requisition/settings'
  | '/seed-dispatches/overview'
  | '/seed-dispatches/analytics'
  | '/seed-dispatches/settings'
  | '/transfer-stock'
  | '/master'
  | '/access-control';

type NavSubItem = {
  title: string;
  url: AppPath;
};

type NavItem = {
  title: string;
  url?: AppPath;
  icon: LucideIcon;
  items?: NavSubItem[];
};

const platformNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Farmers',
    url: '/farmers',
    icon: User,
  },
  {
    title: 'Messages',
    url: '/messages',
    icon: MessageSquare,
  },
  {
    title: 'Notifications',
    url: '/notifications',
    icon: Bell,
  },
  {
    title: 'Seed Requisition',
    url: '/seed-requisition/overview',
    icon: ClipboardList,
    items: [
      { title: 'Overview', url: '/seed-requisition/overview' },
      { title: 'Analytics', url: '/seed-requisition/analytics' },
      { title: 'Settings', url: '/seed-requisition/settings' },
    ],
  },
  {
    title: 'Seed-Dispatches',
    url: '/seed-dispatches/overview',
    icon: Truck,
    items: [
      { title: 'Overview', url: '/seed-dispatches/overview' },
      { title: 'Analytics', url: '/seed-dispatches/analytics' },
      { title: 'Settings', url: '/seed-dispatches/settings' },
    ],
  },
  {
    title: 'Transfer Stock',
    url: '/transfer-stock',
    icon: ArrowLeftRight,
  },
  {
    title: 'Master',
    url: '/master',
    icon: Database,
  },
  {
    title: 'Access Control',
    url: '/access-control',
    icon: Shield,
  },
];

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function isPathActive(pathname: string, url?: string) {
  if (!url) return false;
  const current = normalizePath(pathname);
  const target = normalizePath(url);
  return current === target || current.startsWith(`${target}/`);
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.items?.length) {
    return item.items.some((subItem) => isPathActive(pathname, subItem.url));
  }
  return isPathActive(pathname, item.url);
}

const ADMIN_NAV_PATHS = new Set<AppPath>(['/master', '/access-control']);

function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: me } = useMe();
  const showAdminNav = canAccessAdminRoutes(me?.user.role);

  const navItems = platformNavItems.filter((item) => {
    if (!item.url || !ADMIN_NAV_PATHS.has(item.url)) return true;
    return showAdminNav;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Platform
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item);

            if (item.items?.length) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={active}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                      <Link to={item.url ?? item.items[0].url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle {item.title}</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isPathActive(pathname, subItem.url)}
                            >
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link to={item.url ?? '/dashboard'}>
                    <Icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { data: me } = useMe();
  const userName = me?.user?.name;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <img src="/favicon.svg" alt={env.appName} className="size-8 shrink-0 rounded-md" />
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm tracking-tight">
                    <span className="font-semibold text-sidebar-foreground">{env.appName}</span>
                  </span>
                  {userName ? (
                    <span className="truncate text-xs text-muted-foreground" title={userName}>
                      {userName}
                    </span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
