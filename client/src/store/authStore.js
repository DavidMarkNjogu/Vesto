import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        console.log("🔐 AuthStore: Attempting login for", email);
        set({ loading: true, error: null });
        try {
          const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
          
          if (res.data.success) {
            console.log("✅ AuthStore: Login success", res.data.user);
            set({ 
              user: res.data.user, 
              token: res.data.token, 
              isAuthenticated: true, 
              loading: false 
            });
            return res.data.user.role;
          }
        } catch (err) {
          console.error("❌ AuthStore: Login failed", err);
          set({ 
            error: err.response?.data?.error || 'Login failed. Please check credentials.', 
            loading: false 
          });
          throw err;
        }
      },

      logout: () => {
        console.log("👋 AuthStore: Logging out");
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
      }
    }),
    {
      name: 'vesto-auth-storage',
      onRehydrateStorage: () => (state) => {
        console.log('💾 AuthStore: Hydrated from LocalStorage', state);
      }
    }
  )
);

export default useAuthStore;