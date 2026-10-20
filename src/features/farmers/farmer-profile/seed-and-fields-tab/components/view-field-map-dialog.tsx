import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldPlotMap } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/field-plot-map';
import { getFieldSurvey } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/field-survey';
import type { FarmerField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';

export function ViewFieldMapDialog({
  field,
  onOpenChange,
}: {
  field: FarmerField | null;
  onOpenChange: (open: boolean) => void;
}) {
  const survey = field?.geoLocation ? getFieldSurvey(field.geoLocation) : null;

  return (
    <Dialog open={field !== null && survey !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{field?.name}</DialogTitle>
          <DialogDescription>
            {survey
              ? `${survey.formattedArea.primary} · ${survey.formattedPerimeter}`
              : 'Plot boundary'}
          </DialogDescription>
        </DialogHeader>
        {survey ? (
          <FieldPlotMap
            boundary={survey.boundary}
            interactive
            label={`Map of ${field?.name ?? 'field'}`}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
