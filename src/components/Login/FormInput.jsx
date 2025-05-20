import React from "react";
import { styles } from "./styles";
import { TextField, InputAdornment, IconButton } from "@mui/material";

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
      <TextField
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        name={`${type}-${Math.random()}`}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          style: { textAlign: "right", direction: "ltr" },
          startAdornment: Icon && (
            <InputAdornment position="start">
              <Icon style={{ color: "rgb(190, 190, 190)" }} />
            </InputAdornment>
          ),
        }}
        {...props}
      />

      {VisibilityIcon && (
        <VisibilityIcon
          style={{
            color: "rgb(190, 190, 190)",
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            fontSize: "1.2rem",
          }}
        />
      )}
    </div>
  );
};

export default FormInput;
