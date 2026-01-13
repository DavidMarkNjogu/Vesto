import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
          
          if (res.data.success) {
            set({ 
              user: res.data.user, 
              token: res.data.token, 
              isAuthenticated: true, 
              loading: false 
            });
            return res.data.user.role;
          }
        } catch (err) {
          set({ 
            error: err.response?.data?.error || 'Login failed. Please check credentials.', 
            loading: false 
          });
          throw err;
        }
      },

      logout: () => {
        // 1. Reset State
        set({ user: null, token: null, isAuthenticated: false });
        
        // 2. Nuke Local Storage (The Fix)
        localStorage.removeItem('vesto-auth-storage');
        
        // 3. Force Hard Redirect to clear memory
        window.location.href = '/login';
      }
    }),
    {
      name: 'vesto-auth-storage',
    }
  )
);

export default useAuthStore;