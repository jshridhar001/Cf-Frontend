import { useMemo } from 'react';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useVarieties } from '@/features/master/api/use-varieties';
import { useCreateSeedRequisition } from '@/features/seed-requisition/overview/api/use-create-seed-requisition';
import { useUpdateSeedRequisition } from '@/features/seed-requisition/overview/api/use-update-seed-requisition';
import {
  formatRequestedAcresPayload,
  type SeedRequisition,
  toDateInputValue,
  toRequisitionDateParam,
} from '@/features/seed-requisition/overview/types';
import { SeedRequisitionForm } from '@/features/seed-requisition/report/components/seed-requisition-form';
import type { SeedRequisitionFormOptions } from '@/features/seed-requisition/report/lib/form-options';
import type { CreateSeedRequisitionFormValues } from '@/features/seed-requisition/report/schemas/seed-requisition.schema';

interface RequisitionFormProps {
  requisition?: SeedRequisition | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function toFormValues(requisition: SeedRequisition): CreateSeedRequisitionFormValues {
  const hasAcres = requisition.requestedAcres != null && requisition.requestedAcres !== '';
  return {
    farmerId: requisition.farmerId,
    varietyId: requisition.varietyId,
    quantityMode: hasAcres ? 'acres' : 'bags',
    acres: hasAcres ? Number(requisition.requestedAcres) || 0 : 0,
    seedBags: requisition.requestedBags ?? 0,
    requisitionDate: toDateInputValue(requisition.requisitionDate),
    requestedDeliveryDate: toDateInputValue(requisition.requestedDeliveryDate),
    remarks: requisition.remarks ?? '',
  };
}

function farmerOptionLabel(name: string, accountNumber?: string | null) {
  return accountNumber ? `${name} (${accountNumber})` : name;
}

export function RequisitionForm({ requisition, onSuccess, onCancel }: RequisitionFormProps) {
  const isEdit = requisition != null;
  const { mutateAsync: createRequisition } = useCreateSeedRequisition();
  const { mutateAsync: updateRequisition } = useUpdateSeedRequisition();
  const { data: farmers = [] } = useFarmers();
  const { data: varieties = [] } = useVarieties();

  const options = useMemo<SeedRequisitionFormOptions>(() => {
    const farmerOptions = farmers.map((farmer) => ({
      value: farmer.id,
      label: farmerOptionLabel(farmer.name, farmer.accountNumber),
    }));
    const varietyOptions = varieties.map((variety) => ({
      value: variety.id,
      label: variety.name,
    }));

    if (
      requisition?.farmer &&
      !farmerOptions.some((option) => option.value === requisition.farmerId)
    ) {
      farmerOptions.push({
        value: requisition.farmerId,
        label: farmerOptionLabel(requisition.farmer.name, requisition.farmer.accountNumber),
      });
    }

    if (
      requisition?.variety &&
      !varietyOptions.some((option) => option.value === requisition.varietyId)
    ) {
      varietyOptions.push({
        value: requisition.varietyId,
        label: requisition.variety.name,
      });
    }

    return { farmers: farmerOptions, varieties: varietyOptions };
  }, [farmers, varieties, requisition]);

  const handleSubmit = async (values: CreateSeedRequisitionFormValues) => {
    const remarks = values.remarks.trim() || undefined;
    const quantity =
      values.quantityMode === 'bags'
        ? { requestedBags: values.seedBags, requestedAcres: null }
        : {
            requestedBags: null,
            requestedAcres: formatRequestedAcresPayload(String(values.acres)),
          };

    if (isEdit) {
      await updateRequisition({
        requisitionId: requisition.id,
        ...quantity,
        requestedDeliveryDate: toRequisitionDateParam(values.requestedDeliveryDate),
        remarks: remarks ?? null,
      });
    } else {
      await createRequisition({
        farmerId: values.farmerId,
        varietyId: values.varietyId,
        requisitionDate: toRequisitionDateParam(values.requisitionDate),
        requestedDeliveryDate: toRequisitionDateParam(values.requestedDeliveryDate),
        remarks,
        ...(values.quantityMode === 'bags'
          ? { requestedBags: values.seedBags }
          : { requestedAcres: formatRequestedAcresPayload(String(values.acres)) }),
      });
    }

    onSuccess?.();
  };

  return (
    <SeedRequisitionForm
      key={isEdit ? requisition.id : 'create'}
      options={options}
      defaultValues={isEdit ? toFormValues(requisition) : undefined}
      isEdit={isEdit}
      submitLabel={isEdit ? 'Save changes' : 'Create Requisition'}
      pendingLabel={isEdit ? 'Saving...' : 'Creating...'}
      onSubmit={handleSubmit}
      onCancel={() => onCancel?.()}
    />
  );
}
