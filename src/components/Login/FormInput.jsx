import React, { useMemo } from "react";
import { styles } from "./styles";
import { TextField, InputAdornment } from "@mui/material";

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
  name,
  ...props
}) => {
  const isPassword = type === "password";

  const inputLabelProps = useMemo(
    () => ({
      shrink: true,
    }),
    []
  );

  const inputProps = useMemo(
    () => ({
      style: { textAlign: "right", direction: "ltr" },
      startAdornment: Icon && (
        <InputAdornment position="start">
          <Icon style={{ color: "rgb(190, 190, 190)" }} />
        </InputAdornment>
      ),
    }),
    [Icon]
  );

  const visibilityIconStyle = useMemo(
    () => ({
      color: "rgb(190, 190, 190)",
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      fontSize: "1.2rem",
    }),
    []
  );

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
        name={name || type}
        fullWidth
        InputLabelProps={inputLabelProps}
        InputProps={inputProps}
        {...props}
      />

      {VisibilityIcon && <VisibilityIcon style={visibilityIconStyle} />}
    </div>
  );
};

export default FormInput;
