export const seedRequisitionKeys = {
  all: ['seed-requisitions'] as const,
  list: () => [...seedRequisitionKeys.all, 'list'] as const,
  detail: (id: string) => [...seedRequisitionKeys.all, 'detail', id] as const,
};

export const seedRequisitionReportKeys = {
  all: ['seed-requisition', 'report'] as const,
  list: () => [...seedRequisitionReportKeys.all, 'list'] as const,
};
