import React from "react";
import { styles } from "../styles";
import FormInput from "../FormInput";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import KeyIcon from "@mui/icons-material/Key";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const LoginForm = ({
  formData,
  error,
  isLoading,
  showPassword,
  handleInputChange,
  handleSubmit,
  togglePassword,
}) => {
  const isFormValid =
    formData.username.trim() !== "" && formData.password.trim() !== "";

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div
        style={styles.decorativeCircle({ top: "-50px", left: "-50px" }, [
          "#3498db",
          "#2980b9",
        ])}
      />
      <div
        style={styles.decorativeCircle(
          { bottom: "-30px", right: "-30px", size: "60px" },
          ["#e74c3c", "#c0392b"]
        )}
      />

      {error && (
        <div style={styles.errorContainer}>
          <ErrorOutlineIcon style={{ fontSize: "1.2rem" }} /> {error}
        </div>
      )}

      <FormInput
        type="text"
        name="username"
        placeholder="نام کاربری"
        value={formData.username}
        onChange={handleInputChange}
        icon={PersonIcon}
        disabled={isLoading}
      />

      <FormInput
        type="password"
        name="password"
        placeholder="رمز عبور"
        value={formData.password}
        onChange={handleInputChange}
        icon={showPassword ? VisibilityOffIcon : VisibilityIcon}
        showPassword={showPassword}
        onTogglePassword={togglePassword}
        disabled={isLoading}
      />

      <button
        type="submit"
        style={{
          ...styles.submitButton(isLoading),
          opacity: !isFormValid ? 0.5 : isLoading ? 0.7 : 1,
          cursor: !isFormValid
            ? "not-allowed"
            : isLoading
            ? "not-allowed"
            : "pointer",
        }}
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? (
          <>
            <HourglassEmptyIcon style={{ fontSize: "1.2rem" }} /> ورود...
          </>
        ) : (
          <>
            <KeyIcon style={{ fontSize: "1.2rem" }} /> ورود
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
