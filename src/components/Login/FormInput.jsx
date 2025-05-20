import React from "react";
import { styles } from "./styles";

const FormInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  visibilityIcon: VisibilityIcon,
  disabled,
  showPassword,
  onTogglePassword,
  ...props
}) => {
  const isPassword = type === "password";

  return (
    <div style={styles.inputContainer}>
      {Icon && <Icon style={{ ...styles.icon, color: "rgb(190, 190, 190)" }} />}

      <input
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          ...styles.input,
          ...(document.activeElement ===
          document.querySelector(`input[placeholder="${placeholder}"]`)
            ? styles.inputFocus
            : {}),
        }}
        disabled={disabled}
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        name={`${type}-${Math.random()}`}
        {...props}
      />
      {!!isPassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          style={styles.passwordToggle}
          disabled={disabled}
        >
          {VisibilityIcon && (
            <VisibilityIcon
              style={{ fontSize: "1.2rem", color: "rgb(190, 190, 190)" }}
            />
          )}
        </button>
      )}
    </div>
  );
};

export default FormInput;
