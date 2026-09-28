import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyPage } from '@/features/legal/components/privacy-policy-page';

export const Route = createFileRoute('/privacy-policy')({
  head: () => ({
    meta: [{ title: 'Privacy Policy — Contract Farming' }],
  }),
  component: PrivacyPolicyPage,
});
