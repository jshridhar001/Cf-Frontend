import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_TOKEN_STORAGE_KEY = 'cf.auth_token';

type AuthTokenState = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthTokenStore = create<AuthTokenState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    { name: AUTH_TOKEN_STORAGE_KEY },
  ),
);

export function getAuthToken(): string | null {
  return useAuthTokenStore.getState().token;
}

export function setAuthToken(token: string): void {
  useAuthTokenStore.getState().setToken(token);
}

export function clearAuthToken(): void {
  useAuthTokenStore.getState().clearToken();
}
