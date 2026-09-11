import { createFileRoute } from '@tanstack/react-router';
import FarmersReportPage from '@/features/farmers/report/components/FarmersReportPage';

export const Route = createFileRoute('/_authenticated/farmers/report')({
  component: FarmersReportPage,
});
