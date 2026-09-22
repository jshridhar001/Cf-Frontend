import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import {
  ADDRESS_LEVEL_CONFIG,
  type AddressFormValues,
  type AddressLevel,
  buildAddressPayload,
  type CascadeValues,
  emptyCascade,
} from '@/features/master/lib/address-levels';
import type {
  AddressArea,
  AddressDistrict,
  AddressEntity,
  AddressItemResponse,
  AddressListResponse,
  AddressMessageResponse,
  AddressPoliceStation,
  AddressPostOffice,
  AddressVillage,
} from '@/features/master/types/addresses';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export async function fetchAddressList(
  level: AddressLevel,
  parentId?: string,
): Promise<AddressEntity[]> {
  const { data } = await apiClient.get<AddressListResponse<AddressEntity>>(
    ADDRESS_LEVEL_CONFIG[level].path,
    { params: parentId ? { parentId } : undefined },
  );
  return data.data;
}

export async function fetchAddressById(level: AddressLevel, id: string): Promise<AddressEntity> {
  const { data } = await apiClient.get<AddressItemResponse<AddressEntity>>(
    `${ADDRESS_LEVEL_CONFIG[level].path}/${id}`,
  );
  return data.data;
}

export function addressListQueryOptions(level: AddressLevel, parentId?: string) {
  return queryOptions({
    queryKey: masterKeys.addresses(level, parentId),
    queryFn: () => fetchAddressList(level, parentId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useAddressList(level: AddressLevel, parentId?: string, enabled = true) {
  return useQuery({
    ...addressListQueryOptions(level, parentId),
    enabled,
  });
}

async function cascadeFromEntity(
  level: AddressLevel,
  entity: AddressEntity,
): Promise<CascadeValues> {
  const values = emptyCascade();

  switch (level) {
    case 'states':
      return values;
    case 'districts': {
      values.stateId = 'stateId' in entity ? entity.stateId : '';
      return values;
    }
    case 'post-offices': {
      const postOffice = entity as AddressPostOffice;
      values.districtId = postOffice.districtId;
      values.stateId = postOffice.district?.stateId ?? '';
      if (!values.stateId && values.districtId) {
        const district = (await fetchAddressById(
          'districts',
          values.districtId,
        )) as AddressDistrict;
        values.stateId = district.stateId;
      }
      return values;
    }
    case 'police-stations': {
      const policeStation = entity as AddressPoliceStation;
      values.postOfficeId = policeStation.postOfficeId;
      values.districtId = policeStation.postOffice?.districtId ?? '';
      if (values.districtId) {
        const district = (await fetchAddressById(
          'districts',
          values.districtId,
        )) as AddressDistrict;
        values.stateId = district.stateId;
      }
      return values;
    }
    case 'villages': {
      const village = entity as AddressVillage;
      values.policeStationId = village.policeStationId;
      values.postOfficeId = village.policeStation?.postOfficeId ?? '';
      if (values.postOfficeId) {
        const postOffice = (await fetchAddressById(
          'post-offices',
          values.postOfficeId,
        )) as AddressPostOffice;
        values.districtId = postOffice.districtId;
        values.stateId = postOffice.district?.stateId ?? '';
        if (!values.stateId && values.districtId) {
          const district = (await fetchAddressById(
            'districts',
            values.districtId,
          )) as AddressDistrict;
          values.stateId = district.stateId;
        }
      }
      return values;
    }
    case 'areas': {
      const area = entity as AddressArea;
      const village = area.village;
      const policeStation = village?.policeStation;
      const postOffice = policeStation?.postOffice;
      const district = postOffice?.district;
      values.villageId = area.villageId;
      values.policeStationId = policeStation?.id ?? village?.policeStationId ?? '';
      values.postOfficeId = postOffice?.id ?? policeStation?.postOfficeId ?? '';
      values.districtId = district?.id ?? postOffice?.districtId ?? '';
      values.stateId = district?.state?.id ?? district?.stateId ?? '';
      return values;
    }
  }
}

export async function resolveAddressCascade(options: {
  level: AddressLevel;
  entity?: AddressEntity | null;
  parentId?: string;
}): Promise<CascadeValues> {
  const { level, entity, parentId } = options;

  if (entity) {
    return cascadeFromEntity(level, entity);
  }

  const parentLevel = ADDRESS_LEVEL_CONFIG[level].parentLevel;
  if (!parentId || !parentLevel) {
    return emptyCascade();
  }

  const parent = await fetchAddressById(parentLevel, parentId);
  const values = await cascadeFromEntity(parentLevel, parent);
  values[ADDRESS_LEVEL_CONFIG[parentLevel].idField] = parent.id;
  return values;
}

async function invalidateAddressQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: masterKeys.addresses() });
}

export function useCreateAddress(level: AddressLevel) {
  const queryClient = useQueryClient();
  const config = ADDRESS_LEVEL_CONFIG[level];

  return useMutation({
    mutationKey: ['master', 'create-address', level],
    mutationFn: async (values: AddressFormValues) => {
      const { data } = await apiClient.post<AddressItemResponse<AddressEntity>>(
        config.path,
        buildAddressPayload(level, values),
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (entity) => {
      await invalidateAddressQueries(queryClient);
      toast.success(`${config.singular} created successfully`, {
        description: `${entity.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to create ${config.singular.toLowerCase()}. Please try again.`,
        ),
        { position: 'bottom-right' },
      );
    },
  });
}

export function useUpdateAddress(level: AddressLevel) {
  const queryClient = useQueryClient();
  const config = ADDRESS_LEVEL_CONFIG[level];

  return useMutation({
    mutationKey: ['master', 'update-address', level],
    mutationFn: async ({ id, values }: { id: string; values: AddressFormValues }) => {
      const { data } = await apiClient.put<AddressItemResponse<AddressEntity>>(
        `${config.path}/${id}`,
        buildAddressPayload(level, values),
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (entity) => {
      await invalidateAddressQueries(queryClient);
      toast.success(`${config.singular} updated successfully`, {
        description: `${entity.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to update ${config.singular.toLowerCase()}. Please try again.`,
        ),
        { position: 'bottom-right' },
      );
    },
  });
}

export function useDeleteAddress(level: AddressLevel) {
  const queryClient = useQueryClient();
  const config = ADDRESS_LEVEL_CONFIG[level];

  return useMutation({
    mutationKey: ['master', 'delete-address', level],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<AddressMessageResponse>(`${config.path}/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await invalidateAddressQueries(queryClient);
      toast.success(data.message || `${config.singular} deleted successfully`, {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to delete ${config.singular.toLowerCase()}. Please try again.`,
        ),
        { position: 'bottom-right' },
      );
    },
  });
}

export function useDeleteAllAddresses(level: AddressLevel) {
  const queryClient = useQueryClient();
  const config = ADDRESS_LEVEL_CONFIG[level];

  return useMutation({
    mutationKey: ['master', 'delete-all-addresses', level],
    mutationFn: async () => {
      const { data } = await apiClient.delete<AddressMessageResponse>(`${config.path}/all`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await invalidateAddressQueries(queryClient);
      toast.success(data.message || `All ${config.label.toLowerCase()} deleted successfully`, {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to delete ${config.label.toLowerCase()}. Please try again.`,
        ),
        { position: 'bottom-right' },
      );
    },
  });
}
