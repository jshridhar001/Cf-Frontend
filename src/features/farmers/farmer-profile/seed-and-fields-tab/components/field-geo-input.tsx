import { useEffect, useMemo, useState } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  BoundaryUploadCard,
  type BoundaryUploadMeta,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/boundary-upload-card';
import { FieldPlotMap } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/field-plot-map';
import { getFieldSurveyFromInput } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/field-survey';

type FieldGeoInputProps = {
  id?: string;
  value: string;
  fieldName?: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  optional?: boolean;
};

const SAVED_BOUNDARY_META: BoundaryUploadMeta = {
  name: 'Current boundary',
  size: 0,
};

export function FieldGeoInput({
  id = 'field-geo',
  value,
  fieldName,
  onBlur,
  onChange,
  isInvalid,
  errors,
  optional = true,
}: FieldGeoInputProps) {
  const [fileMeta, setFileMeta] = useState<BoundaryUploadMeta | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const survey = useMemo(() => (value.trim() ? getFieldSurveyFromInput(value) : null), [value]);

  useEffect(() => {
    if (!value.trim()) {
      setFileMeta(null);
      setParseError(null);
    }
  }, [value]);

  const attachmentMeta = fileMeta ?? (survey && !parseError ? SAVED_BOUNDARY_META : null);

  return (
    <Field data-invalid={isInvalid || Boolean(parseError)}>
      <FieldLabel htmlFor={id}>
        {optional ? 'Plot boundary (optional)' : 'Plot boundary'}
      </FieldLabel>
      <FieldDescription>
        {optional
          ? 'Upload a KML file to map the plot boundary.'
          : 'Upload a KML file. Acres are calculated from the plot boundary.'}
      </FieldDescription>
      <BoundaryUploadCard
        id={id}
        fileMeta={attachmentMeta}
        error={parseError}
        onParsed={(data, meta) => {
          setFileMeta(meta);
          setParseError(null);
          onChange(JSON.stringify(data));
          onBlur();
        }}
        onError={(message, meta) => {
          setFileMeta(meta);
          setParseError(message);
          onChange('');
          onBlur();
        }}
        onClear={() => {
          setFileMeta(null);
          setParseError(null);
          onChange('');
          onBlur();
        }}
      />
      {isInvalid ? <FieldError errors={errors} /> : null}

      {survey ? (
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/40 p-4">
          <div>
            <p className="text-sm font-medium">Map preview</p>
            <p className="text-xs text-muted-foreground">
              Survey area {survey.formattedArea.primary} ({survey.formattedArea.secondary})
            </p>
          </div>
          <FieldPlotMap
            boundary={survey.boundary}
            label={`Plot preview of ${fieldName?.trim() || 'field'}`}
            className="h-48 w-full"
          />
        </div>
      ) : null}
    </Field>
  );
}
