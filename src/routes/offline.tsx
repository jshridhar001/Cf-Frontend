import { createFileRoute } from '@tanstack/react-router';
import { OfflinePage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/offline')({
  component: OfflinePage,
});
