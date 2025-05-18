import React from "react";
import { styles } from "./styles";

const FormInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled,
  showPassword,
  onTogglePassword,
  ...props
}) => {
  const isPassword = type === "password";

  return (
    <div style={styles.inputContainer}>
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
      {isPassword ? (
        <button
          type="button"
          onClick={onTogglePassword}
          style={styles.passwordToggle}
          disabled={disabled}
        >
          {Icon && <Icon style={{ fontSize: "1.2rem" }} />}
        </button>
      ) : (
        Icon && <Icon style={styles.icon} />
      )}
    </div>
  );
};

export default FormInput;
