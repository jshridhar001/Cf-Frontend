import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { Farmer } from '@/features/farmers/overview/types';

function farmerLabel(farmer: Farmer) {
  return `${farmer.name} (#${farmer.accountNumber})`;
}

export function FarmerCombobox({
  farmers,
  value,
  onValueChange,
  placeholder = 'Select farmer',
  disabled = false,
  id,
  invalid = false,
  allowClear = false,
}: {
  farmers: Farmer[];
  value: string;
  onValueChange: (farmerId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  allowClear?: boolean;
}) {
  const selected = farmers.find((farmer) => farmer.id === value) ?? null;

  return (
    <Combobox
      items={farmers}
      value={selected}
      onValueChange={(farmer) => onValueChange(farmer?.id ?? '')}
      itemToStringLabel={farmerLabel}
      itemToStringValue={(farmer) => farmer.id}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        showClear={allowClear}
        disabled={disabled}
        aria-invalid={invalid}
        className="w-full min-w-0"
      />
      <ComboboxContent className="min-w-(--anchor-width)">
        <ComboboxEmpty>No farmers found.</ComboboxEmpty>
        <ComboboxList>
          {(farmer) => (
            <ComboboxItem key={farmer.id} value={farmer}>
              {farmerLabel(farmer)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
