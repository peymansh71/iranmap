import React from "react";
import { styles } from "../styles";
import FormInput from "../FormInput";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import KeyIcon from "@mui/icons-material/Key";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LockIcon from "@mui/icons-material/Lock";

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
    <form onSubmit={handleSubmit} style={styles.form} dir="rtl">
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "1rem",
          }}
        >
          ورود به پلتفرم نمایش جزئیات پروژه‌ها و اماکت صیاحتی قرار گاه خاتم
        </h2>
        <div
          style={{
            height: "2px",
            background:
              "linear-gradient(to right, transparent, rgb(215 215 215), transparent)",
            width: "100%",
          }}
        />
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <ErrorOutlineIcon style={{ fontSize: "1.2rem" }} /> {error}
        </div>
      )}

      <FormInput
        type="text"
        name="username"
        label="نام کاربری"
        value={formData.username}
        onChange={handleInputChange}
        icon={PersonIcon}
        disabled={isLoading}
      />

      <FormInput
        type="password"
        name="password"
        label="گذرواژه"
        value={formData.password}
        onChange={handleInputChange}
        icon={LockIcon}
        visibilityIcon={showPassword ? VisibilityOffIcon : VisibilityIcon}
        showPassword={showPassword}
        onTogglePassword={togglePassword}
        disabled={isLoading}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "0.95rem",
            color: "#334155",
            gap: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe || false}
            onChange={handleInputChange}
            disabled={isLoading}
            style={{ accentColor: "#3498db", width: "16px", height: "16px" }}
          />
          مرا بخاطر بسپار
        </label>
      </div>

      <div
        style={{
          height: "2px",
          background:
            "linear-gradient(to right, transparent, rgb(215 215 215), transparent)",
          width: "100%",
          marginTop: "3rem",
          marginBottom: "1rem",
        }}
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
