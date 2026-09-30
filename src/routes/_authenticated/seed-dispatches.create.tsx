import { createFileRoute } from '@tanstack/react-router';
import CreateSeedDispatchPage from '@/features/seed-dispatch/create/components/CreateSeedDispatchPage';

export const Route = createFileRoute('/_authenticated/seed-dispatches/create')({
  component: CreateSeedDispatchPage,
});
