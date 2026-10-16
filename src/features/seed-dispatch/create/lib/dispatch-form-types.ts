export type DispatchSizeLineDraft = {
  facilityId: string;
  sizeId: string;
  generationId: string;
  quantity: string;
};

export type DispatchRequisitionSelectionMap = Map<string, DispatchSizeLineDraft[]>;

export function getSelectionTotal(sizeLines: DispatchSizeLineDraft[]) {
  return sizeLines.reduce((sum, line) => {
    const value = Number.parseFloat(line.quantity);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

export function hasValidSelection(sizeLines: DispatchSizeLineDraft[]) {
  return sizeLines.some((line) => {
    const value = Number.parseFloat(line.quantity);
    return (
      Boolean(line.facilityId) &&
      Boolean(line.sizeId) &&
      Boolean(line.generationId) &&
      Number.isFinite(value) &&
      value > 0
    );
  });
}

export function selectionsToInput(
  selections: DispatchRequisitionSelectionMap,
  requisitions: Array<{ id: string; requisitionId: string }>,
): Array<{ requisitionId: string; deliveryId: string; sizeLines: DispatchSizeLineDraft[] }> {
  return Array.from(selections.entries())
    .filter(([, sizeLines]) => hasValidSelection(sizeLines))
    .flatMap(([deliveryId, sizeLines]) => {
      const requisitionId = requisitions.find((row) => row.id === deliveryId)?.requisitionId;
      if (!requisitionId) return [];
      return [
        {
          requisitionId,
          deliveryId,
          sizeLines: sizeLines.filter((line) => {
            const value = Number.parseFloat(line.quantity);
            return (
              Boolean(line.facilityId) &&
              Boolean(line.sizeId) &&
              Boolean(line.generationId) &&
              Number.isFinite(value) &&
              value > 0
            );
          }),
        },
      ];
    });
}
