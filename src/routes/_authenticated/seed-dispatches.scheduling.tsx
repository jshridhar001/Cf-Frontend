import { createFileRoute } from '@tanstack/react-router';
import { DispatchSchedulingPage } from '@/features/seed-dispatch/scheduling/components/DispatchSchedulingPage';

export const Route = createFileRoute('/_authenticated/seed-dispatches/scheduling')({
  component: DispatchSchedulingPage,
});
