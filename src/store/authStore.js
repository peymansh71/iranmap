import { create } from "zustand";
import { persist } from "zustand/middleware";

// Static user credentials
const STATIC_CREDENTIALS = {
  username: "admin",
  password: "iran-map-2024",
  displayName: "مدیر سیستم",
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      loginAttempts: 0,
      lastFailedAttempt: null,

      login: async (username, password) => {
        const state = get();

        // Check if user is temporarily locked due to failed attempts
        if (state.loginAttempts >= 5) {
          const lockoutTime = 15 * 60 * 1000; // 15 minutes
          const timeSinceLastAttempt =
            Date.now() - (state.lastFailedAttempt || 0);

          if (timeSinceLastAttempt < lockoutTime) {
            const remainingMinutes = Math.ceil(
              (lockoutTime - timeSinceLastAttempt) / 60000
            );
            return {
              status: 423,
              message: `حساب کاربری به دلیل تلاش‌های ناموفق قفل شده است. ${remainingMinutes} دقیقه صبر کنید.`,
            };
          } else {
            // Reset attempts after lockout period
            set({ loginAttempts: 0, lastFailedAttempt: null });
          }
        }

        // Validate credentials
        if (
          username === STATIC_CREDENTIALS.username &&
          password === STATIC_CREDENTIALS.password
        ) {
          const token =
            "iran-map-token-" +
            Date.now() +
            "-" +
            Math.random().toString(36).substring(7);

          const user = {
            username: STATIC_CREDENTIALS.username,
            displayName: STATIC_CREDENTIALS.displayName,
            loginTime: new Date().toISOString(),
          };

          set({
            token,
            isAuthenticated: true,
            user,
            loginAttempts: 0,
            lastFailedAttempt: null,
          });

          return { status: 200, message: "ورود موفقیت‌آمیز" };
        } else {
          // Invalid credentials
          const newAttempts = state.loginAttempts + 1;
          set({
            loginAttempts: newAttempts,
            lastFailedAttempt: Date.now(),
          });

          if (newAttempts >= 5) {
            return {
              status: 401,
              message: "نام کاربری یا رمز عبور اشتباه است. حساب شما قفل شد.",
            };
          } else {
            const remainingAttempts = 5 - newAttempts;
            return {
              status: 401,
              message: `نام کاربری یا رمز عبور اشتباه است. ${remainingAttempts} تلاش باقی مانده.`,
            };
          }
        }
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
        });
      },

      // Check if account is locked
      isAccountLocked: () => {
        const state = get();
        if (state.loginAttempts >= 5) {
          const lockoutTime = 15 * 60 * 1000; // 15 minutes
          const timeSinceLastAttempt =
            Date.now() - (state.lastFailedAttempt || 0);
          return timeSinceLastAttempt < lockoutTime;
        }
        return false;
      },

      // Reset login attempts (for admin purposes)
      resetLoginAttempts: () => {
        set({ loginAttempts: 0, lastFailedAttempt: null });
      },
    }),
    {
      name: "auth-storage",
      // Add partialize to prevent unnecessary re-renders
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loginAttempts: state.loginAttempts,
        lastFailedAttempt: state.lastFailedAttempt,
      }),
    }
  )
);

export default useAuthStore;
