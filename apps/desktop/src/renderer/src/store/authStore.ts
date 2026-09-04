import { create } from "zustand";

export interface AuthSession {
  userId: string;
  username: string;
  fullName: string;
  roleName: string;
  permissions: string[];
}

interface AuthState {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  hasPermission: (permission) => get().session?.permissions.includes(permission) ?? false,
}));
