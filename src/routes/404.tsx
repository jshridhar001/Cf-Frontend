import { createFileRoute } from '@tanstack/react-router';
import { NotFoundPage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});
