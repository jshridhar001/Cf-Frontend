import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/features/system/components/status-pages';

export const Route = createFileRoute('/coming-soon')({
  component: ComingSoonPage,
});
