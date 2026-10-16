import { createFileRoute } from '@tanstack/react-router';
import { gatePassesQueryOptions } from '@/features/cs-gate-pass/api/use-gate-passes';
import { CsGatePassPage } from '@/features/cs-gate-pass/components/CsGatePassPage';
import { facilitiesQueryOptions } from '@/features/master/api/use-facilities';
import { generationsQueryOptions } from '@/features/master/api/use-generations';
import { seedSizesQueryOptions } from '@/features/master/api/use-seed-sizes';
import { varietiesQueryOptions } from '@/features/master/api/use-varieties';

export const Route = createFileRoute('/_authenticated/cs-gate-pass')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(gatePassesQueryOptions());
    void context.queryClient.prefetchQuery(facilitiesQueryOptions());
    void context.queryClient.prefetchQuery(varietiesQueryOptions());
    void context.queryClient.prefetchQuery(generationsQueryOptions());
    void context.queryClient.prefetchQuery(seedSizesQueryOptions());
  },
  component: CsGatePassPage,
});
