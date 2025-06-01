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

interface AddHotelModalProps {
  open: boolean;
  onClose: () => void;
  provinceList: Province[];
  selectedProvince: Province | null;
  setSelectedProvince: (province: Province | null) => void;
  hotelName: string;
  setHotelName: (hotelName: string) => void;
  hotelType: string;
  setHotelType: (hotelType: string) => void;
  fields: Field[];
  onFieldChange: (idx: number, key: string, val: string) => void;
  onAddField: () => void;
  onRemoveField: (idx: number) => void;
  onSave: () => void;
}

const steps = ["اطلاعات اقامتگاه", "امکانات و ویژگی‌ها"];

const hotelTypes = ["ویلا", "اپارتمان", "هتل", "هتل آپارتمان"];

// Hotel-specific fields instead of using general indexes
const hotelFields = [
  "ظرفیت",
  "تعداد اتاق",
  "تعداد ستاره",
  "قیمت شب (تومان)",
  "پارکینگ",
  "رستوران",
  "استخر",
  "سالن ورزش",
  "اینترنت وای‌فای",
  "سرویس روم",
  "آسانسور",
  "تهویه مطبوع",
  "سالن کنفرانس",
  "باغ",
  "نمایش دریا",
  "نمایش کوه",
  "فاصله تا مرکز شهر (کیلومتر)",
  "فاصله تا فرودگاه (کیلومتر)",
  "ساعت تحویل",
  "ساعت تخلیه",
  "صبحانه",
  "لابی",
  "نگهبانی ۲۴ ساعته",
  "سرویس شستشو",
  "اتاق غیرسیگاری",
  "امکانات معلولین",
  "حیوانات خانگی",
  "کیفیت خدمات",
];

const AddHotelModal: React.FC<AddHotelModalProps> = ({
  open,
  onClose,
  provinceList,
  selectedProvince,
  setSelectedProvince,
  hotelName,
  setHotelName,
  hotelType,
  setHotelType,
  fields,
  onFieldChange,
  onAddField,
  onRemoveField,
  onSave,
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
    selectedProvince && hotelName.trim().length > 0 && hotelType.length > 0;
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
              برای شروع، نام اقامتگاه و نوع آن را وارد کنید
            </Typography>
            <Autocomplete
              options={provinceList}
              value={selectedProvince}
              onChange={(_, newValue) => {
                setSelectedProvince(newValue);
                if (newValue?.id !== selectedProvince?.id) {
                  setHotelName(""); // Only reset hotel name when province actually changes
                  setHotelType(""); // Also reset hotel type
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
              label="نام اقامتگاه"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              fullWidth
              placeholder="نام اقامتگاه را وارد کنید"
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>نوع اقامتگاه</InputLabel>
              <Select
                value={hotelType}
                label="نوع اقامتگاه"
                onChange={(e) => setHotelType(e.target.value)}
                required
              >
                {hotelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              استان: <strong>{selectedProvince?.name_fa}</strong> | اقامتگاه:{" "}
              <strong>{hotelName}</strong>
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              نوع اقامتگاه: <strong>{hotelType}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              مشخصات و امکانات اقامتگاه را تکمیل کنید
            </Typography>
            {fields.map((field, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}
              >
                <Autocomplete
                  options={hotelFields}
                  value={field.label}
                  onChange={(_, newValue) =>
                    onFieldChange(idx, "label", newValue || "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="مشخصات" variant="outlined" />
                  )}
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="مقدار"
                  type="text"
                  value={field.value}
                  onChange={(e) => onFieldChange(idx, "value", e.target.value)}
                  sx={{ flex: 1 }}
                  placeholder={
                    field.label === "تعداد ستاره"
                      ? "1-5"
                      : field.label === "ظرفیت"
                      ? "تعداد نفر"
                      : field.label === "تعداد اتاق"
                      ? "عدد"
                      : field.label === "قیمت شب (تومان)"
                      ? "مثال: 500000"
                      : field.label === "فاصله تا مرکز شهر (کیلومتر)" ||
                        field.label === "فاصله تا فرودگاه (کیلومتر)"
                      ? "عدد"
                      : field.label === "ساعت تحویل" ||
                        field.label === "ساعت تخلیه"
                      ? "مثال: 14:00"
                      : field.label === "پارکینگ" ||
                        field.label === "رستوران" ||
                        field.label === "استخر" ||
                        field.label === "اینترنت وای‌فای" ||
                        field.label === "سرویس روم" ||
                        field.label === "آسانسور" ||
                        field.label === "تهویه مطبوع" ||
                        field.label === "سالن کنفرانس" ||
                        field.label === "باغ" ||
                        field.label === "نمایش دریا" ||
                        field.label === "نمایش کوه" ||
                        field.label === "صبحانه" ||
                        field.label === "لابی" ||
                        field.label === "نگهبانی ۲۴ ساعته" ||
                        field.label === "سرویس شستشو" ||
                        field.label === "اتاق غیرسیگاری" ||
                        field.label === "امکانات معلولین" ||
                        field.label === "حیوانات خانگی"
                      ? "دارد/ندارد"
                      : field.label === "کیفیت خدمات"
                      ? "عالی/خوب/متوسط"
                      : "مقدار..."
                  }
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
              افزودن مشخصات
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
      aria-labelledby="add-hotel-modal"
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
          افزودن اقامتگاه
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

export default AddHotelModal;
