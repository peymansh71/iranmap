import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import ConstructionIcon from "@mui/icons-material/Construction";
import HotelIcon from "@mui/icons-material/Hotel";
import useEmployeeStore from "../../../../store/employeeStore.ts";
import useProvinceInfoStore from "../../../../store/provinceInfoStore";

const getRelativeTime = (isoString: string | null): string => {
  if (!isoString) return "آپلود نشده";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} روز پیش`;
  } else if (diffHours > 0) {
    return `${diffHours} ساعت پیش`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} دقیقه پیش`;
  } else {
    return "همین الان";
  }
};

const getStatusColor = (
  isoString: string | null
): "default" | "success" | "warning" | "error" => {
  if (!isoString) return "default";

  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 1) return "success";
  if (diffDays <= 7) return "warning";
  return "error";
};

export const LastImportStatus: React.FC = () => {
  const employeeStore = useEmployeeStore();
  const provinceInfoStore = useProvinceInfoStore();

  const lastEmployeeImport = employeeStore.getLastExcelImportTime();
  const lastProjectsImport = provinceInfoStore.getLastProjectsExcelImportTime();
  const lastHotelsImport = provinceInfoStore.getLastHotelsExcelImportTime();

  const imports = [
    {
      icon: <PeopleIcon sx={{ fontSize: 16 }} />,
      label: "نیروها",
      timestamp: lastEmployeeImport,
      color: getStatusColor(lastEmployeeImport),
    },
    {
      icon: <ConstructionIcon sx={{ fontSize: 16 }} />,
      label: "پروژه‌ها",
      timestamp: lastProjectsImport,
      color: getStatusColor(lastProjectsImport),
    },
    {
      icon: <HotelIcon sx={{ fontSize: 16 }} />,
      label: "اقامتگاه‌ها",
      timestamp: lastHotelsImport,
      color: getStatusColor(lastHotelsImport),
    },
  ];

  return (
    <Box
      sx={{
        mb: 3,
        p: 1,
        bgcolor: "rgba(33, 150, 243, 0.04)",
        borderRadius: 2,
        border: "1px solid rgba(33, 150, 243, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          آخرین به‌روزرسانی اکسل
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {imports.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {item.icon}
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.5,
              }}
            >
              <Chip
                size="small"
                label={getRelativeTime(item.timestamp)}
                color={item.color}
                variant={item.timestamp ? "filled" : "outlined"}
                sx={{
                  fontSize: "0.7rem",
                  minWidth: 80,
                  cursor: "help",
                }}
              />
              {item.timestamp && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.6rem",
                    color: "text.secondary",
                    textAlign: "right",
                  }}
                >
                  {new Date(item.timestamp).toLocaleDateString("fa-IR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LastImportStatus;
