import { create } from 'zustand';

type ApiPendingState = {
  pendingCount: number;
  beginRequest: () => void;
  endRequest: () => void;
};

export const useApiPendingStore = create<ApiPendingState>((set) => ({
  pendingCount: 0,
  beginRequest: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
  endRequest: () => set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}));

export function beginRequest() {
  useApiPendingStore.getState().beginRequest();
}

export function endRequest() {
  useApiPendingStore.getState().endRequest();
}
