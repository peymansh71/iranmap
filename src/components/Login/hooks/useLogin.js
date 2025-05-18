import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";

export const useLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(formData.username, formData.password);
      if (response.status === 200) {
        navigate("/");
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است");
      }
    } catch (err) {
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
