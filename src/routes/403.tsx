import { createFileRoute } from '@tanstack/react-router';
import { ForbiddenPage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/403')({
  component: ForbiddenPage,
});
