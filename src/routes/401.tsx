import { createFileRoute } from '@tanstack/react-router';
import { UnauthorizedPage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/401')({
  component: UnauthorizedPage,
});
