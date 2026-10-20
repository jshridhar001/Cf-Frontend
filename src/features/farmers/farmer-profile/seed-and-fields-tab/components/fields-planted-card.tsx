import { Link } from '@tanstack/react-router';
import { Map as MapIcon, Pencil, Plus, Sprout, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddFieldSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/add-field-sheet';
import { DeleteFieldDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/delete-field-dialog';
import { EditFieldSheet } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/edit-field-sheet';
import { FieldPlotMap } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/field-plot-map';
import { ViewFieldMapDialog } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/view-field-map-dialog';
import { getFieldSurvey } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/field-survey';
import type { FarmerField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';

export function FieldsPlantedCard({
  farmerId,
  fields,
  isPending,
  errorMessage,
}: {
  farmerId: string;
  fields: FarmerField[];
  isPending: boolean;
  errorMessage: string | null;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [viewingField, setViewingField] = useState<FarmerField | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [deletingField, setDeletingField] = useState<FarmerField | null>(null);

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sprout className="size-4" />
          </span>
          Fields Planted
        </CardTitle>
        <CardDescription className="hidden sm:block">
          Land parcels associated with this farmer
        </CardDescription>
        <CardAction>
          <Button type="button" className="hidden md:inline-flex" onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Add field
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11 md:hidden"
            aria-label="Add field"
            onClick={() => setAddOpen(true)}
          >
            <Plus />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : errorMessage ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-destructive">
            {errorMessage}
          </p>
        ) : fields.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            This farmer has no fields planted.
          </p>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-36">Plot</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Survey area</TableHead>
                    <TableHead className="w-28">Map</TableHead>
                    <TableHead className="w-24">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <FieldRow
                      key={field.id}
                      farmerId={farmerId}
                      field={field}
                      onView={() => setViewingField(field)}
                      onEdit={() => setEditingFieldId(field.id)}
                      onDelete={() => setDeletingField(field)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <ItemGroup className="md:hidden">
              {fields.map((field) => (
                <FieldListItem
                  key={field.id}
                  farmerId={farmerId}
                  field={field}
                  onView={() => setViewingField(field)}
                  onEdit={() => setEditingFieldId(field.id)}
                  onDelete={() => setDeletingField(field)}
                />
              ))}
            </ItemGroup>
          </>
        )}
      </PageCardContent>
      <AddFieldSheet farmerId={farmerId} open={addOpen} onOpenChange={setAddOpen} />
      <EditFieldSheet
        fieldId={editingFieldId}
        open={editingFieldId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingFieldId(null);
        }}
      />
      <DeleteFieldDialog
        field={deletingField}
        open={deletingField !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingField(null);
        }}
        onDeleted={() => {
          if (viewingField?.id === deletingField?.id) setViewingField(null);
        }}
      />
      <ViewFieldMapDialog
        field={viewingField}
        onOpenChange={(open) => {
          if (!open) setViewingField(null);
        }}
      />
    </PageCard>
  );
}

function FieldNameLink({ farmerId, field }: { farmerId: string; field: FarmerField }) {
  return (
    <Link
      to="/farmers/$id/fields/$fieldId"
      params={{ id: farmerId, fieldId: field.id }}
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {field.name}
    </Link>
  );
}

function FieldRow({
  farmerId,
  field,
  onView,
  onEdit,
  onDelete,
}: {
  farmerId: string;
  field: FarmerField;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const survey = useMemo(
    () => (field.geoLocation ? getFieldSurvey(field.geoLocation) : null),
    [field.geoLocation],
  );

  return (
    <TableRow>
      <TableCell>
        {survey ? (
          <FieldPlotMap boundary={survey.boundary} label={`Plot preview of ${field.name}`} />
        ) : (
          <EmptyValue />
        )}
      </TableCell>
      <TableCell>
        <FieldNameLink farmerId={farmerId} field={field} />
      </TableCell>
      <TableCell>{survey ? survey.formattedArea.primary : <EmptyValue />}</TableCell>
      <TableCell>{survey ? <ViewMapButton onClick={onView} /> : <EmptyValue />}</TableCell>
      <TableCell>
        <FieldRowActions onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}

function FieldListItem({
  farmerId,
  field,
  onView,
  onEdit,
  onDelete,
}: {
  farmerId: string;
  field: FarmerField;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const survey = useMemo(
    () => (field.geoLocation ? getFieldSurvey(field.geoLocation) : null),
    [field.geoLocation],
  );

  return (
    <Item variant="outline" size="sm" className="items-start">
      {survey ? (
        <ItemMedia className="translate-y-0 self-start">
          <FieldPlotMap boundary={survey.boundary} label={`Plot preview of ${field.name}`} />
        </ItemMedia>
      ) : null}
      <ItemContent className="min-w-0">
        <ItemTitle>
          <FieldNameLink farmerId={farmerId} field={field} />
        </ItemTitle>
        <ItemDescription>
          {survey ? survey.formattedArea.primary : 'No survey area'}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {survey ? <ViewMapButton className="min-h-11" onClick={onView} /> : null}
        <FieldRowActions className="min-h-11 min-w-11" onEdit={onEdit} onDelete={onDelete} />
      </ItemActions>
    </Item>
  );
}

function FieldRowActions({
  onEdit,
  onDelete,
  className,
}: {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={className}
        aria-label="Edit field"
        onClick={onEdit}
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={className}
        aria-label="Delete field"
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

function ViewMapButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button type="button" variant="ghost" size="sm" className={className} onClick={onClick}>
      <MapIcon />
      View
    </Button>
  );
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}
