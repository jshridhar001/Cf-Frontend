import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  SAMPLE_REQUISITION_FARMERS,
  SAMPLE_REQUISITION_VARIETIES,
  SAMPLE_SEED_REQUISITIONS,
} from '@/features/seed-requisition/overview/lib/sample-data';
import type {
  SeedRequisition,
  SeedRequisitionListParams,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

export type CreateSeedRequisitionVariables = {
  farmerId: string;
  varietyId: string;
  requestedBags?: number;
  requestedAcres?: string;
  requisitionDate: string;
  requestedDeliveryDate: string;
  remarks?: string;
};

export type UpdateSeedRequisitionVariables = {
  requisitionId: string;
  requestedBags?: number | null;
  requestedAcres?: string | null;
  requestedDeliveryDate?: string;
  remarks?: string | null;
};

export type ReviewSeedRequisitionVariables = {
  requisitionId: string;
  status: Extract<SeedRequisitionStatus, 'APPROVED' | 'REJECTED'>;
  approvedDeliveryDate?: string;
  rejectionRemarks?: string;
};

type RequisitionSampleStore = {
  items: SeedRequisition[];
  isSaving: boolean;
  createRequisition: (variables: CreateSeedRequisitionVariables) => Promise<void>;
  updateRequisition: (variables: UpdateSeedRequisitionVariables) => Promise<void>;
  reviewRequisition: (variables: ReviewSeedRequisitionVariables) => Promise<void>;
  deleteRequisition: (requisitionId: string) => Promise<void>;
  deleteAllRequisitions: () => Promise<void>;
  resetRequisitions: () => void;
};

const RequisitionSampleContext = createContext<RequisitionSampleStore | null>(null);

function cloneSampleRequisitions() {
  return structuredClone(SAMPLE_SEED_REQUISITIONS);
}

export function filterSampleRequisitions(
  items: SeedRequisition[],
  params: SeedRequisitionListParams,
) {
  return items.filter((item) => {
    if (params.status && item.status !== params.status) return false;
    if (params.farmerId && item.farmerId !== params.farmerId) return false;
    if (params.varietyId && item.varietyId !== params.varietyId) return false;
    if (params.requisitionDateFrom && item.requisitionDate < params.requisitionDateFrom) {
      return false;
    }
    if (params.requisitionDateTo && item.requisitionDate > params.requisitionDateTo) return false;
    return true;
  });
}

export function RequisitionSampleProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SeedRequisition[]>(cloneSampleRequisitions);
  const [isSaving, setIsSaving] = useState(false);

  const value = useMemo<RequisitionSampleStore>(() => {
    const run = async (action: () => void, onSuccess: () => void) => {
      setIsSaving(true);
      try {
        action();
        onSuccess();
      } finally {
        setIsSaving(false);
      }
    };

    return {
      items,
      isSaving,
      createRequisition: (variables) =>
        run(
          () => {
            const farmer = SAMPLE_REQUISITION_FARMERS.find(
              (option) => option.id === variables.farmerId,
            );
            const variety = SAMPLE_REQUISITION_VARIETIES.find(
              (option) => option.id === variables.varietyId,
            );
            const now = new Date().toISOString();
            const created: SeedRequisition = {
              id: `REQUISITION_${crypto.randomUUID()}`,
              farmerId: variables.farmerId,
              varietyId: variables.varietyId,
              status: 'PENDING',
              requestedBags: variables.requestedBags ?? null,
              requestedAcres: variables.requestedAcres ?? null,
              fulfilledBags: 0,
              fulfilledAcres: '0',
              requisitionDate: variables.requisitionDate,
              requestedDeliveryDate: variables.requestedDeliveryDate,
              approvedDeliveryDate: null,
              remarks: variables.remarks ?? null,
              rejectionRemarks: null,
              createdById: 'USER_ID',
              approvedById: null,
              rejectedById: null,
              approvedAt: null,
              rejectedAt: null,
              createdAt: now,
              updatedAt: now,
              farmer: farmer
                ? { name: farmer.name, accountNumber: farmer.accountNumber ?? '' }
                : null,
              variety: variety ? { name: variety.name } : null,
            };
            setItems((current) => [created, ...current]);
          },
          () => {
            toast.success('Requisition created successfully', { position: 'bottom-right' });
          },
        ),
      updateRequisition: (variables) =>
        run(
          () => {
            const now = new Date().toISOString();
            setItems((current) =>
              current.map((item) =>
                item.id === variables.requisitionId
                  ? {
                      ...item,
                      requestedBags:
                        variables.requestedBags !== undefined
                          ? variables.requestedBags
                          : item.requestedBags,
                      requestedAcres:
                        variables.requestedAcres !== undefined
                          ? variables.requestedAcres
                          : item.requestedAcres,
                      requestedDeliveryDate:
                        variables.requestedDeliveryDate ?? item.requestedDeliveryDate,
                      remarks: variables.remarks !== undefined ? variables.remarks : item.remarks,
                      updatedAt: now,
                    }
                  : item,
              ),
            );
          },
          () => {
            toast.success('Requisition updated successfully', { position: 'bottom-right' });
          },
        ),
      reviewRequisition: (variables) => {
        const farmerName = items.find((item) => item.id === variables.requisitionId)?.farmer?.name;
        return run(
          () => {
            const now = new Date().toISOString();
            setItems((current) =>
              current.map((item) => {
                if (item.id !== variables.requisitionId) return item;
                if (variables.status === 'APPROVED') {
                  return {
                    ...item,
                    status: 'APPROVED',
                    approvedDeliveryDate: variables.approvedDeliveryDate ?? null,
                    approvedAt: now,
                    approvedById: 'USER_ID',
                    updatedAt: now,
                  };
                }
                return {
                  ...item,
                  status: 'REJECTED',
                  rejectionRemarks: variables.rejectionRemarks ?? null,
                  rejectedAt: now,
                  rejectedById: 'USER_ID',
                  updatedAt: now,
                };
              }),
            );
          },
          () => {
            toast.success(
              variables.status === 'APPROVED' ? 'Requisition approved' : 'Requisition rejected',
              {
                description: farmerName ? `${farmerName} was updated.` : undefined,
                position: 'bottom-right',
              },
            );
          },
        );
      },
      deleteRequisition: (requisitionId) =>
        run(
          () => {
            setItems((current) => current.filter((item) => item.id !== requisitionId));
          },
          () => {
            toast.success('Requisition deleted successfully', { position: 'bottom-right' });
          },
        ),
      deleteAllRequisitions: () =>
        run(
          () => {
            setItems([]);
          },
          () => {
            toast.success('All requisitions deleted successfully', { position: 'bottom-right' });
          },
        ),
      resetRequisitions: () => {
        setItems(cloneSampleRequisitions());
      },
    };
  }, [isSaving, items]);

  return (
    <RequisitionSampleContext.Provider value={value}>{children}</RequisitionSampleContext.Provider>
  );
}

export function useRequisitionSampleStore() {
  const store = useContext(RequisitionSampleContext);
  if (!store) {
    throw new Error('useRequisitionSampleStore must be used within RequisitionSampleProvider');
  }
  return store;
}
