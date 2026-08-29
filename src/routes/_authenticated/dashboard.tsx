import { createFileRoute } from '@tanstack/react-router';
import { useMe } from '@/features/auth/api/use-me';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: me, isPending, isError, error } = useMe();

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Dashboard
        </h1>
        <p className="hidden text-sm leading-relaxed text-muted-foreground sm:block">
          Temporary session debug view — remove once real dashboard content is ready.
        </p>
      </div>

      {isPending ? <p className="text-sm text-muted-foreground">Loading session…</p> : null}

      {isError ? (
        <p className="text-sm text-destructive">
          Failed to load session{error instanceof Error ? `: ${error.message}` : '.'}
        </p>
      ) : null}

      {me ? (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <section className="space-y-2">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              User
            </h2>
            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed sm:p-4">
              {JSON.stringify(me.user, null, 2)}
            </pre>
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Session
            </h2>
            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed sm:p-4">
              {JSON.stringify(me.session, null, 2)}
            </pre>
          </section>
        </div>
      ) : null}
    </div>
  );
}
