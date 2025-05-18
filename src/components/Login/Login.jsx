import React from "react";
import { styles } from "./styles";
import BackgroundImages from "./BackgroundImages";
import LoginForm from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";
import { useBackgroundImages } from "./hooks/useBackgroundImages";

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

  const { currentBg, backgrounds } = useBackgroundImages();

  return (
    <div style={styles.container}>
      <BackgroundImages backgrounds={backgrounds} currentBg={currentBg} />
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
