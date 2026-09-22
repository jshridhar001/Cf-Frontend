import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddressList } from '@/features/master/api/use-addresses';
import { ADDRESS_LEVEL_CONFIG, type AddressLevel } from '@/features/master/lib/address-levels';

interface AddressParentFilterProps {
  level: AddressLevel;
  parentId?: string;
  onParentIdChange: (parentId: string | undefined) => void;
}

export function AddressParentFilter({
  level,
  parentId,
  onParentIdChange,
}: AddressParentFilterProps) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const parentLevel = config.parentLevel;

  const { data: parents = [] } = useAddressList(
    parentLevel ?? 'states',
    undefined,
    Boolean(parentLevel),
  );

  if (!parentLevel || !config.parentLabel) {
    return null;
  }

  return (
    <Select
      value={parentId ?? 'all'}
      onValueChange={(value) => onParentIdChange(value === 'all' ? undefined : value)}
    >
      <SelectTrigger size="default" className="h-9 w-full sm:h-8 sm:w-56">
        <SelectValue placeholder={`All ${ADDRESS_LEVEL_CONFIG[parentLevel].label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          All {ADDRESS_LEVEL_CONFIG[parentLevel].label.toLowerCase()}
        </SelectItem>
        {parents.map((parent) => (
          <SelectItem key={parent.id} value={parent.id}>
            {parent.name}
            {'pincode' in parent && parent.pincode ? ` · ${parent.pincode}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
