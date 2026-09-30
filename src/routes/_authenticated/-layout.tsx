import { Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthenticatedLayout({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="!mt-0 md:!mt-0 md:rounded-t-none">
        <AppTopbar />
        <section
          data-main-scroll
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6"
        >
          <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-4 sm:gap-6">
            {children ?? <Outlet />}
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AuthenticatedPending() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-4 sm:gap-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-md rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </AuthenticatedLayout>
  );
}
