import { Link, useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth/api/use-me';
import { env } from '@/lib/env';

const BRAND_LOGO_SRC =
  'https://res.cloudinary.com/dakh64xhy/image/upload/v1759410800/Bhatti-Agritech_gwqywg.jpg';

type StatusPageProps = {
  code?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function StatusPage({ code, title, description, children }: StatusPageProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <img
          src={BRAND_LOGO_SRC}
          alt={env.appName}
          className="size-16 shrink-0 rounded-md sm:size-20"
        />
        <div className="flex w-full flex-col items-center gap-3">
          {code ? <p className="text-sm text-muted-foreground">{code}</p> : null}
          <h1 className="scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-center text-sm text-muted-foreground">{description}</p>
        </div>
        {children ? <div className="flex w-full flex-col gap-3">{children}</div> : null}
      </div>
    </div>
  );
}

export function StatusHomeButton({
  label = 'Go home',
  variant = 'default',
}: {
  label?: string;
  variant?: 'default' | 'outline';
}) {
  const navigate = useNavigate();
  const { data: me } = useMe();

  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      className="w-full"
      onClick={() => {
        void navigate({ to: me ? '/dashboard' : '/' });
      }}
    >
      {label}
    </Button>
  );
}

export function StatusBackButton() {
  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className="w-full"
      onClick={() => {
        window.history.back();
      }}
    >
      Go back
    </Button>
  );
}

export function StatusRetryButton({ onRetry }: { onRetry?: () => void }) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      onClick={() => {
        if (onRetry) {
          onRetry();
          return;
        }

        window.location.reload();
      }}
    >
      Try again
    </Button>
  );
}

export function StatusLoginButton() {
  return (
    <Button asChild size="lg" className="w-full">
      <Link to="/login">Sign in</Link>
    </Button>
  );
}

export function StatusDashboardButton() {
  return (
    <Button asChild size="lg" className="w-full">
      <Link to="/dashboard">Go to dashboard</Link>
    </Button>
  );
}
