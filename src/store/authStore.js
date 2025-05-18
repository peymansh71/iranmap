import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (username, password) => {
        // Simulate API call
        if (username && password) {
          const fakeToken =
            "fake-jwt-token-" + Math.random().toString(36).substring(7);
          set({ token: fakeToken, isAuthenticated: true });
          return { status: 200 };
        }
        return { status: 401 };
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
