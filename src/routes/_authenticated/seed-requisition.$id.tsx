import { createFileRoute } from '@tanstack/react-router';

import { SeedRequisitionDetail } from '@/features/seed-requisition/report/components/seed-requisition-detail';

export const Route = createFileRoute('/_authenticated/seed-requisition/$id')({
  component: SeedRequisitionDetailRoute,
});

function SeedRequisitionDetailRoute() {
  const { id } = Route.useParams();
  return <SeedRequisitionDetail id={id} />;
}
