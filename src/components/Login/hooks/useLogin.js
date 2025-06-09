import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";

export const useLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const isAccountLocked = useAuthStore((state) => state.isAccountLocked);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!formData.username.trim()) {
      setError("نام کاربری را وارد کنید");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError("رمز عبور را وارد کنید");
      setIsLoading(false);
      return;
    }

    // Check if account is locked
    if (isAccountLocked()) {
      setError("حساب کاربری شما به دلیل تلاش‌های ناموفق قفل شده است");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData.username, formData.password);

      if (response.status === 200) {
        // Successful login
        navigate("/");
      } else {
        // Failed login - show specific error message
        setError(response.message || "نام کاربری یا رمز عبور اشتباه است");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("خطایی رخ داد. لطفا دوباره تلاش کنید");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    formData,
    error,
    isLoading,
    showPassword,
    handleInputChange,
    handleSubmit,
    togglePassword,
  };
};
