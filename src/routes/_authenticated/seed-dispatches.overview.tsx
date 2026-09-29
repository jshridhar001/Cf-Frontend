import { createFileRoute } from '@tanstack/react-router';
import SeedDispatchOverviewPage from '@/features/seed-dispatch/overview/components/SeedDispatchOverviewPage';
import { seedDispatchSearchSchema } from '@/features/seed-dispatch/overview/lib/search';

export const Route = createFileRoute('/_authenticated/seed-dispatches/overview')({
  validateSearch: seedDispatchSearchSchema,
  component: SeedDispatchOverviewPage,
});
