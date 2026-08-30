import { createFileRoute } from '@tanstack/react-router';
import { MaintenancePage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/maintenance')({
  component: MaintenancePage,
});
