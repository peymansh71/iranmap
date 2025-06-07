import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface Province {
  id: number;
  name_fa: string;
}

interface Field {
  label: string;
  value: string;
}

interface AddProvinceInfoModalProps {
  open: boolean;
  onClose: () => void;
  provinceList: Province[];
  selectedProvince: Province | null;
  setSelectedProvince: (province: Province | null) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  projectType: string;
  setProjectType: (type: string) => void;
  fields: Field[];
  onFieldChange: (idx: number, key: string, val: string) => void;
  onAddField: () => void;
  onRemoveField: (idx: number) => void;
  onSave: () => void;
  indexes: string[];
  projectIsActive: boolean;
  setProjectIsActive: (isActive: boolean) => void;
}

const steps = ["اطلاعات پروژه", "شاخص‌های پروژه"];

const projectTypes = [
  "آزادراه و بزرگراه",
  "راه آهن برونشهری",
  "راه اصلی و فرعی",
  "راه آهن شهری و حومه",
  "تونل",
  "تقاطع غیره مسطح",
  "ابنیه",
];

const AddProvinceInfoModal: React.FC<AddProvinceInfoModalProps> = ({
  open,
  onClose,
  provinceList,
  selectedProvince,
  setSelectedProvince,
  projectName,
  setProjectName,
  projectType,
  setProjectType,
  fields,
  onFieldChange,
  onAddField,
  onRemoveField,
  onSave,
  indexes,
  projectIsActive,
  setProjectIsActive,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0); // Reset stepper
    onClose();
  };

  const isStep1Valid =
    selectedProvince && projectName.trim().length > 0 && projectType.length > 0;
  const isStep2Valid = fields.some(
    (field) => field.label.trim() && field.value.trim() !== ""
  );

  // Reset stepper when modal opens
  React.useEffect(() => {
    if (open) {
      setActiveStep(0);
    }
  }, [open]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              برای شروع، نام پروژه و نوع آن را وارد کنید
            </Typography>
            <Autocomplete
              options={provinceList}
              value={selectedProvince}
              onChange={(_, newValue) => {
                setSelectedProvince(newValue);
                if (newValue?.id !== selectedProvince?.id) {
                  setProjectName(""); // Only reset project name when province actually changes
                  setProjectType(""); // Also reset project type
                }
              }}
              getOptionLabel={(option) => option.name_fa}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="انتخاب استان"
                  variant="outlined"
                />
              )}
              sx={{ mb: 2 }}
              fullWidth
              disabled={!!selectedProvince} // Disable if province is already selected (from map click)
            />
            <TextField
              label="نام پروژه"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              fullWidth
              placeholder="نام پروژه را وارد کنید"
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>نوع پروژه</InputLabel>
              <Select
                value={projectType}
                label="نوع پروژه"
                onChange={(e) => setProjectType(e.target.value)}
                required
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={projectIsActive}
                  onChange={(e) => setProjectIsActive(e.target.checked)}
                  color="success"
                />
              }
              label="فعال"
              sx={{ mt: 1 }}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              استان: <strong>{selectedProvince?.name_fa}</strong> | پروژه:{" "}
              <strong>{projectName}</strong>
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              نوع پروژه: <strong>{projectType}</strong>
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              وضعیت:{" "}
              <strong style={{ color: projectIsActive ? "green" : "gray" }}>
                {projectIsActive ? "فعال" : "غیرفعال"}
              </strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              حداقل یک شاخص با مقدار معتبر وارد کنید
            </Typography>
            {fields.map((field, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}
              >
                <Autocomplete
                  options={indexes}
                  value={field.label}
                  onChange={(_, newValue) =>
                    onFieldChange(idx, "label", newValue || "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="شاخص" variant="outlined" />
                  )}
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="مقدار"
                  type="number"
                  value={field.value}
                  onChange={(e) => onFieldChange(idx, "value", e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => onRemoveField(idx)}
                  color="error"
                  disabled={fields.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={onAddField} sx={{ mb: 2 }}>
              افزودن شاخص
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-info-modal"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          minWidth: 700,
          maxWidth: 900,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
          افزودن اطلاعات پروژه
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Box>
            <Button onClick={handleClose} color="error">
              بستن
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              قبلی
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={onSave}
                variant="contained"
                color="primary"
                disabled={!isStep2Valid}
              >
                ذخیره
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={activeStep === 0 && !isStep1Valid}
              >
                بعدی
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddProvinceInfoModal;
