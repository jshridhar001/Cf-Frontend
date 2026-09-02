import { RouteStatusScreen } from '@/components/route-status-screen';
import { cn } from '@/lib/utils';

function NotFoundView({ inset = false }: { inset?: boolean }) {
  return (
    <div className={cn('flex w-full flex-1 flex-col', inset ? 'min-h-0' : 'min-h-dvh')}>
      <RouteStatusScreen
        code="404"
        title="Page not found"
        description="This screen does not exist, or the link may be out of date. Check the URL or return to a page you know."
      />
    </div>
  );
}

export function NotFoundPage() {
  return <NotFoundView />;
}

export function InsetNotFoundPage() {
  return <NotFoundView inset />;
}
