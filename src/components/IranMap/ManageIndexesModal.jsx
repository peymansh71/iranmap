import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
// import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const ManageIndexesModal = ({
  open,
  onClose,
  indexes,
  newIndex,
  setNewIndex,
  onAddIndex,
  onRemoveIndex,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="settings-modal"
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
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        مدیریت شاخص‌ها
      </Typography>
      {indexes.map((idx, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TextField
            value={idx}
            disabled
            sx={{ flex: 1, backgroundColor: "#f0f0f0" }}
          />
          <IconButton onClick={() => onRemoveIndex(i)} color="error">
            <HighlightOffOutlinedIcon />
          </IconButton>
        </Box>
      ))}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, mt: 2 }}>
        <TextField
          label="افزودن شاخص جدید"
          value={newIndex}
          onChange={(e) => setNewIndex(e.target.value)}
          sx={{ flex: 1 }}
        />
        <IconButton onClick={onAddIndex} color="primary">
          <AddOutlinedIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={onClose} color="error">
          بستن
        </Button>
      </Box>
    </Box>
  </Modal>
);

export default ManageIndexesModal;
