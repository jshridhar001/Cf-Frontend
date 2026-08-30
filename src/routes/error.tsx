import { createFileRoute } from '@tanstack/react-router';
import { ErrorPage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/error')({
  component: ErrorPage,
});
