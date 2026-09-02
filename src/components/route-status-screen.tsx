import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { PageCard, PageCardContent } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth/api/use-me';
import { env } from '@/lib/env';

export function RouteStatusScreen({
  code,
  icon,
  title,
  description,
  detail,
  actions,
}: {
  code: string;
  icon?: ReactNode;
  title: string;
  description: string;
  detail?: ReactNode;
  actions?: ReactNode;
}) {
  const { data: me } = useMe();
  const homeTo = me ? '/dashboard' : '/';
  const homeLabel = me ? 'Back to dashboard' : 'Back to home';

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <PageCard className="relative w-full max-w-md overflow-hidden py-10 sm:py-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-4 text-center font-heading text-6xl leading-none font-extrabold tracking-tighter text-muted-foreground/10 select-none sm:top-5 sm:text-7xl"
        >
          {code}
        </span>
        <PageCardContent className="relative flex flex-col items-center px-6 pt-16 text-center sm:px-8 sm:pt-20">
          {icon ? (
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground [&_svg]:size-6">
              {icon}
            </div>
          ) : null}
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{description}</p>
          <p className="mt-3 text-xs tracking-wide text-muted-foreground/70">{env.appName}</p>
          {detail ? <div className="mt-6 w-full">{detail}</div> : null}
          <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            {actions}
            <Button asChild className="w-full sm:w-auto">
              <Link to={homeTo}>{homeLabel}</Link>
            </Button>
          </div>
        </PageCardContent>
      </PageCard>
    </div>
  );
}
