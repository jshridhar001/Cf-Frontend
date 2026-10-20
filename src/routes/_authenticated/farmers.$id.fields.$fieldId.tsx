import { createFileRoute } from '@tanstack/react-router';
import { FieldViewPage } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/field-view-page';

export const Route = createFileRoute('/_authenticated/farmers/$id/fields/$fieldId')({
  component: FieldViewRoute,
});

function FieldViewRoute() {
  const { id, fieldId } = Route.useParams();
  return <FieldViewPage farmerId={id} fieldId={fieldId} />;
}
