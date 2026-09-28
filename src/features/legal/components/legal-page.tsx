import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { BRAND_LEGAL_NAME, BRAND_LOGO_SRC, BRAND_OFFICE_ADDRESS } from '@/lib/brand';
import { env } from '@/lib/env';

export const LEGAL_UPDATED_ON = '29 September 2026';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={BRAND_LOGO_SRC} alt="" className="size-10 shrink-0 rounded-md" />
            <span className="font-semibold tracking-tight">{env.appName}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED_ON}</p>
        <div className="mt-8">{children}</div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <p>
            {BRAND_LEGAL_NAME}
            <br />
            {BRAND_OFFICE_ADDRESS}
          </p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="[&_p]:leading-7 [&_p]:mt-6">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;
}

export function LegalLinks() {
  return (
    <p className="text-sm text-muted-foreground">
      <Link to="/" className="font-medium text-primary underline underline-offset-4">
        Home
      </Link>
      <span aria-hidden="true"> · </span>
      <Link to="/privacy-policy" className="font-medium text-primary underline underline-offset-4">
        Privacy Policy
      </Link>
      <span aria-hidden="true"> · </span>
      <Link
        to="/terms-of-service"
        className="font-medium text-primary underline underline-offset-4"
      >
        Terms of Service
      </Link>
    </p>
  );
}
