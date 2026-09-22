import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FarmerAddressValues } from '@/features/farmers/overview/types';
import { useAddressList } from '@/features/master/api/use-addresses';
import { AddressParentCascade } from '@/features/master/components/addresses/address-parent-cascade';

export function FarmerAddressFields({
  values,
  onChange,
  disabled,
  areaError,
  description,
}: {
  values: FarmerAddressValues;
  onChange: (values: FarmerAddressValues) => void;
  disabled?: boolean;
  areaError?: string;
  description?: string;
}) {
  const { data: areas = [] } = useAddressList('areas', values.villageId, Boolean(values.villageId));
  const isInvalid = Boolean(areaError);

  return (
    <>
      <AddressParentCascade
        level="areas"
        values={values}
        disabled={disabled}
        onChange={(cascade) => onChange({ ...cascade, areaId: '' })}
      />
      <Field data-invalid={isInvalid}>
        <FieldLabel>Area</FieldLabel>
        <Select
          value={values.areaId || undefined}
          disabled={disabled || !values.villageId}
          onValueChange={(next) => {
            if (next) onChange({ ...values, areaId: next });
          }}
        >
          <SelectTrigger aria-invalid={isInvalid} className="w-full">
            <SelectValue placeholder="Select an area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        {isInvalid ? <FieldError>{areaError}</FieldError> : null}
      </Field>
    </>
  );
}
