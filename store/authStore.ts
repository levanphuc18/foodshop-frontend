import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '@/types/auth';
import { clearAuthCookies } from '@/lib/api/auth';
import { useCartStore } from './cartStore';

interface AuthState {
  user: { username: string; userId: number; role: 'ADMIN' | 'CUSTOMER' } | null;
  isAuthenticated: boolean;
  setAuth: (authData: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (authData) => set({ 
        user: { username: authData.username, userId: authData.userId, role: authData.role }, 
        isAuthenticated: true 
      }),
      logout: () => {
        clearAuthCookies();
        // Clear cart store state immediately
        useCartStore.getState().clearCart();
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' } // Zustand sẽ lưu mỗi metadata (username, userId) trong localStorage
  )
);
