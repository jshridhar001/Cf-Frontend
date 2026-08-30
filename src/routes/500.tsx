import { createFileRoute } from '@tanstack/react-router';
import { ServerErrorPage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/500')({
  component: ServerErrorPage,
});
