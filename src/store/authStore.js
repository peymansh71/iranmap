import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        try {
          set({ isLoading: true, error: null });
          const { user, token } = await authAPI.login(username, password);
          localStorage.setItem("token", token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (username, password) => {
        try {
          set({ isLoading: true, error: null });
          const { user, token } = await authAPI.register(username, password);
          localStorage.setItem("token", token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const user = await authAPI.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          localStorage.removeItem("token");
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
