import { createFileRoute } from '@tanstack/react-router';
import FarmersOverviewPage from '@/features/farmers/overview/components/FarmersOverviewPage';

export const Route = createFileRoute('/_authenticated/farmers/overview')({
  component: FarmersOverviewPage,
});
