import { createFileRoute } from '@tanstack/react-router';
import FarmersAnalyticsPage from '@/features/farmers/analytics/components/FarmersAnalyticsPage';

export const Route = createFileRoute('/_authenticated/farmers/analytics')({
  component: FarmersAnalyticsPage,
});
