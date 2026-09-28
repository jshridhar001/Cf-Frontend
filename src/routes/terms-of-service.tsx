import { createFileRoute } from '@tanstack/react-router';
import { TermsOfServicePage } from '@/features/legal/components/terms-of-service-page';

export const Route = createFileRoute('/terms-of-service')({
  head: () => ({
    meta: [{ title: 'Terms of Service — Contract Farming' }],
  }),
  component: TermsOfServicePage,
});
