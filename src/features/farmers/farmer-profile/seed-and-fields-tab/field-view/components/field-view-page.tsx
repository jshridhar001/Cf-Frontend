import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field';
import { FieldPlotMap } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/field-plot-map';
import { FieldActivitiesTab } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/field-activities-tab';
import { FieldVisitsTab } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/field-visits-tab';
import { FieldMapDetailsCard } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-view/components/field-map-details-card';
import { getFieldSurvey } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/field-survey';

export function FieldViewPage({ farmerId, fieldId }: { farmerId: string; fieldId: string }) {
  const { data: field, isPending, isError } = useField(fieldId);
  const survey = field?.geoLocation ? getFieldSurvey(field.geoLocation) : null;
  const missing = !isPending && (isError || !field);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link to="/farmers/$id/fields" params={{ id: farmerId }}>
          <ArrowLeft className="size-4" />
          Back to fields
        </Link>
      </Button>
      {isPending ? <Skeleton className="h-[70vh] min-h-80 w-full rounded-xl" /> : null}
      {missing ? (
        <p className="text-sm text-muted-foreground">This field could not be found.</p>
      ) : null}
      {field ? (
        <>
          <div className="relative h-[70vh] min-h-80">
            {survey ? (
              <FieldPlotMap
                boundary={survey.boundary}
                interactive
                zoomControlPosition="bottomright"
                className="h-full w-full rounded-xl"
                label={`Map of ${field.name}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-muted px-4 text-center text-sm text-muted-foreground">
                No plot boundary
              </div>
            )}
            <FieldMapDetailsCard field={field} survey={survey} />
          </div>
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="activities">Field Activities</TabsTrigger>
              <TabsTrigger value="visits">Field Visits</TabsTrigger>
            </TabsList>
            <TabsContent value="activities">
              <FieldActivitiesTab fieldId={field.id} fieldAcres={field.acres} />
            </TabsContent>
            <TabsContent value="visits">
              <FieldVisitsTab fieldId={field.id} />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
