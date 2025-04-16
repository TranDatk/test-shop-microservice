import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/api/auth/login', { email, password });
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });
          await api.post('/api/auth/register', { name, email, password });
          // After registration, login automatically
          await get().login(email, password);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          await api.post('/api/auth/logout');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const response = await api.get('/api/auth/me');
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-store',
      // Don't persist sensitive data like tokens
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
); 