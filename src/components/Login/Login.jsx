import React from "react";
import { styles } from "./styles";
import LoginForm from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";

const Login = () => {
  const {
    formData,
    error,
    isLoading,
    showPassword,
    handleInputChange,
    handleSubmit,
    togglePassword,
  } = useLogin();

  return (
    <div style={styles.container}>
      <LoginForm
        formData={formData}
        error={error}
        isLoading={isLoading}
        showPassword={showPassword}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        togglePassword={togglePassword}
      />
    </div>
  );
};

export default Login;
