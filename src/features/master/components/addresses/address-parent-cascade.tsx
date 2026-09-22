import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddressList } from '@/features/master/api/use-addresses';
import {
  ADDRESS_LEVEL_CONFIG,
  type AddressLevel,
  type CascadeIdField,
  type CascadeValues,
  emptyCascade,
  getAncestorLevels,
} from '@/features/master/lib/address-levels';

interface AddressParentCascadeProps {
  level: AddressLevel;
  values: CascadeValues;
  onChange: (values: CascadeValues) => void;
  disabled?: boolean;
  errors?: Partial<Record<CascadeIdField, string>>;
}

function AddressCascadeSelect({
  level,
  parentId,
  value,
  onValueChange,
  disabled,
  error,
}: {
  level: AddressLevel;
  parentId?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const enabled = !config.parentFk || Boolean(parentId);
  const { data: options = [] } = useAddressList(level, parentId, enabled);
  const isInvalid = Boolean(error);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{config.singular}</FieldLabel>
      <Select
        value={value || undefined}
        disabled={disabled || !enabled}
        onValueChange={(next) => {
          if (next) onValueChange(next);
        }}
      >
        <SelectTrigger aria-invalid={isInvalid} className="w-full">
          <SelectValue placeholder={`Select a ${config.singular.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
              {'pincode' in option && option.pincode ? ` · ${option.pincode}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

export function AddressParentCascade({
  level,
  values,
  onChange,
  disabled,
  errors,
}: AddressParentCascadeProps) {
  const ancestors = getAncestorLevels(level);

  if (ancestors.length === 0) {
    return null;
  }

  return (
    <>
      {ancestors.map((ancestorLevel) => {
        const config = ADDRESS_LEVEL_CONFIG[ancestorLevel];
        const parentLevel = config.parentLevel;
        const parentId = parentLevel
          ? values[ADDRESS_LEVEL_CONFIG[parentLevel].idField]
          : undefined;

        return (
          <AddressCascadeSelect
            key={ancestorLevel}
            level={ancestorLevel}
            parentId={parentId || undefined}
            value={values[config.idField]}
            disabled={disabled}
            error={errors?.[config.idField]}
            onValueChange={(next) => {
              const cleared = emptyCascade();
              const ancestorIndex = ancestors.indexOf(ancestorLevel);
              for (const keep of ancestors.slice(0, ancestorIndex)) {
                cleared[ADDRESS_LEVEL_CONFIG[keep].idField] =
                  values[ADDRESS_LEVEL_CONFIG[keep].idField];
              }
              cleared[config.idField] = next;
              onChange(cleared);
            }}
          />
        );
      })}
    </>
  );
}
