import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import useEmployeeStore from "../../store/employeeStore.ts";

interface Province {
  id: number;
  name_fa: string;
  name_en?: string;
}

interface EmployeeManagementModalProps {
  open: boolean;
  onClose: () => void;
  provinces: Province[];
}

const EmployeeManagementModal: React.FC<EmployeeManagementModalProps> = ({
  open,
  onClose,
  provinces,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeCounts, setEmployeeCounts] = useState<Record<number, number>>(
    {}
  );

  const {
    employees,
    addOrUpdateEmployees,
    getTotalEmployees,
    clearAllEmployees,
    getEmployeesByProvince,
  } = useEmployeeStore();

  // Initialize employee counts from store
  useEffect(() => {
    const initialCounts: Record<number, number> = {};
    employees.forEach((emp) => {
      initialCounts[emp.provinceId] = emp.employeeCount;
    });
    setEmployeeCounts(initialCounts);
  }, [employees, open]);

  const handleEmployeeCountChange = (
    provinceId: number,
    provinceName: string,
    count: string
  ) => {
    const numericCount = parseInt(count) || 0;
    setEmployeeCounts((prev) => ({
      ...prev,
      [provinceId]: numericCount,
    }));

    // Immediately save to store
    addOrUpdateEmployees(provinceId, provinceName, numericCount);
  };

  const handleDeleteEmployee = (provinceId: number) => {
    setEmployeeCounts((prev) => {
      const updated = { ...prev };
      delete updated[provinceId];
      return updated;
    });
    addOrUpdateEmployees(provinceId, "", 0);
  };

  const handleClearAll = () => {
    setEmployeeCounts({});
    clearAllEmployees();
  };

  const filteredProvinces = provinces.filter((province) =>
    province.name_fa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const provincesWithEmployees = employees.filter(
    (emp) => emp.employeeCount > 0
  );
  const totalEmployees = getTotalEmployees();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="employee-management-modal"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 3,
          minWidth: 600,
          maxWidth: 800,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <PeopleIcon sx={{ mr: 2, color: "primary.main" }} />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
            مدیریت نیروی استان‌ها
          </Typography>
          <IconButton onClick={onClose} size="small">
            ✕
          </IconButton>
        </Box>

        {/* Summary */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "rgba(25, 118, 210, 0.08)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>
            آمار کلی: {totalEmployees} نفر در {provincesWithEmployees.length}{" "}
            استان
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {provincesWithEmployees.slice(0, 5).map((emp) => (
              <Chip
                key={emp.provinceId}
                label={`${emp.provinceName}: ${emp.employeeCount}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {provincesWithEmployees.length > 5 && (
              <Chip
                label={`+${provincesWithEmployees.length - 5} استان دیگر`}
                size="small"
                color="default"
              />
            )}
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="جستجوی استان..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Provinces List */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
          }}
        >
          <List dense>
            {filteredProvinces.map((province, index) => {
              const currentCount = employeeCounts[province.id] || 0;
              const hasEmployees = currentCount > 0;

              return (
                <React.Fragment key={province.id}>
                  <ListItem
                    sx={{
                      bgcolor: hasEmployees
                        ? "rgba(76, 175, 80, 0.05)"
                        : "transparent",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                      <PersonIcon
                        sx={{
                          color: hasEmployees ? "success.main" : "grey.400",
                          fontSize: 20,
                        }}
                      />
                    </Box>
                    <ListItemText
                      primary={province.name_fa}
                      secondary={
                        hasEmployees ? `${currentCount} نفر` : "بدون نیرو"
                      }
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontWeight: hasEmployees ? 600 : 400,
                          color: hasEmployees ? "success.main" : "text.primary",
                        },
                        "& .MuiListItemText-secondary": {
                          color: hasEmployees
                            ? "success.main"
                            : "text.secondary",
                        },
                      }}
                    />
                    <ListItemSecondaryAction
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <TextField
                        type="number"
                        value={currentCount || ""}
                        onChange={(e) =>
                          handleEmployeeCountChange(
                            province.id,
                            province.name_fa,
                            e.target.value
                          )
                        }
                        size="small"
                        sx={{ width: 100 }}
                        InputProps={{
                          inputProps: { min: 0, max: 99999 },
                        }}
                        placeholder="تعداد"
                      />
                      {hasEmployees && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEmployee(province.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredProvinces.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            onClick={handleClearAll}
            color="error"
            variant="outlined"
            disabled={totalEmployees === 0}
          >
            پاک کردن همه
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={onClose} variant="outlined">
              بستن
            </Button>
            <Button onClick={onClose} variant="contained" color="primary">
              تایید
            </Button>
          </Box>
        </Box>

        {/* Help Text */}
        {totalEmployees === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            تعداد نیروها هر استان را وارد کنید تا در نقشه نمایش داده شود
          </Alert>
        )}
      </Box>
    </Modal>
  );
};

export default EmployeeManagementModal;
