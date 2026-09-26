import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SAMPLE_ADDRESS_OPTIONS } from '@/features/farmers/overview/data/sample-farmers';
import type { FarmerAddressValues } from '@/features/farmers/overview/types';

function optionsFor(options: { id: string; name: string; parentId?: string }[], parentId: string) {
  if (!parentId) return [];
  return options.filter((option) => option.parentId === parentId);
}

function AddressSelect({
  label,
  value,
  placeholder,
  disabled,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  options: { id: string; name: string }[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        value={value || undefined}
        disabled={disabled || options.length === 0}
        onValueChange={(next) => {
          if (next) onValueChange(next);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

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
  const districts = optionsFor(SAMPLE_ADDRESS_OPTIONS.districts, values.stateId);
  const postOffices = optionsFor(SAMPLE_ADDRESS_OPTIONS.postOffices, values.districtId);
  const policeStations = optionsFor(SAMPLE_ADDRESS_OPTIONS.policeStations, values.postOfficeId);
  const villages = optionsFor(SAMPLE_ADDRESS_OPTIONS.villages, values.policeStationId);
  const areas = optionsFor(SAMPLE_ADDRESS_OPTIONS.areas, values.villageId);
  const isInvalid = Boolean(areaError);

  return (
    <>
      <AddressSelect
        label="State"
        value={values.stateId}
        placeholder="Select a state"
        disabled={disabled}
        options={SAMPLE_ADDRESS_OPTIONS.states}
        onValueChange={(stateId) =>
          onChange({
            stateId,
            districtId: '',
            postOfficeId: '',
            policeStationId: '',
            villageId: '',
            areaId: '',
          })
        }
      />
      <AddressSelect
        label="District"
        value={values.districtId}
        placeholder="Select a district"
        disabled={disabled || !values.stateId}
        options={districts}
        onValueChange={(districtId) =>
          onChange({
            ...values,
            districtId,
            postOfficeId: '',
            policeStationId: '',
            villageId: '',
            areaId: '',
          })
        }
      />
      <AddressSelect
        label="Post office"
        value={values.postOfficeId}
        placeholder="Select a post office"
        disabled={disabled || !values.districtId}
        options={postOffices}
        onValueChange={(postOfficeId) =>
          onChange({
            ...values,
            postOfficeId,
            policeStationId: '',
            villageId: '',
            areaId: '',
          })
        }
      />
      <AddressSelect
        label="Police station"
        value={values.policeStationId}
        placeholder="Select a police station"
        disabled={disabled || !values.postOfficeId}
        options={policeStations}
        onValueChange={(policeStationId) =>
          onChange({
            ...values,
            policeStationId,
            villageId: '',
            areaId: '',
          })
        }
      />
      <AddressSelect
        label="Village"
        value={values.villageId}
        placeholder="Select a village"
        disabled={disabled || !values.policeStationId}
        options={villages}
        onValueChange={(villageId) =>
          onChange({
            ...values,
            villageId,
            areaId: '',
          })
        }
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
