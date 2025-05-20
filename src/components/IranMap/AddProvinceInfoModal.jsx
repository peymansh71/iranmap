import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

const AddProvinceInfoModal = ({
  open,
  onClose,
  provinceList,
  selectedProvince,
  setSelectedProvince,
  fields,
  onFieldChange,
  onAddField,
  onRemoveField,
  onSave,
  indexes,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="add-info-modal"
    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 4,
        borderRadius: 2,
        minWidth: 600,
        maxWidth: 800,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        افزودن اطلاعات
      </Typography>
      <Autocomplete
        options={provinceList}
        value={selectedProvince}
        onChange={(_, newValue) => setSelectedProvince(newValue)}
        getOptionLabel={(option) => option.name_fa}
        renderInput={(params) => (
          <TextField {...params} label="انتخاب استان" variant="outlined" />
        )}
        sx={{ mb: 2 }}
        fullWidth
      />
      {selectedProvince && (
        <>
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
              <IconButton onClick={() => onRemoveField(idx)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={onAddField} sx={{ mb: 2 }}>
            افزودن شاخص
          </Button>
        </>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
        <Button onClick={onSave} variant="contained" color="primary">
          ذخیره
        </Button>
        <Button onClick={onClose} color="error">
          بستن
        </Button>
      </Box>
    </Box>
  </Modal>
);

export default AddProvinceInfoModal;
