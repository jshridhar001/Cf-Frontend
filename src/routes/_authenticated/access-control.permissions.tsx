import { createFileRoute } from '@tanstack/react-router';
import { PermissionsTabContent } from '@/features/access-control/components/permissions/PermissionsTabContent';

export const Route = createFileRoute('/_authenticated/access-control/permissions')({
  component: AccessControlPermissionsPage,
});

function AccessControlPermissionsPage() {
  return <PermissionsTabContent />;
}
