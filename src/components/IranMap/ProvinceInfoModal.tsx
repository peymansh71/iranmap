import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import HotelIcon from "@mui/icons-material/Hotel";
import ConstructionIcon from "@mui/icons-material/Construction";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ProvinceTable from "./components/ProvinceTable.tsx";
import ProvincePieChart from "./components/ProvincePieChart.tsx";
import ProvinceBarChart from "./components/ProvinceBarChart.tsx";

const ProvinceInfoModal = ({
  open,
  onClose,
  provinceInfo,
  tab,
  setTab,
  selectedProjectName,
  isBottomLeft = false,
}) => {
  const [selectedProject, setSelectedProject] = useState("");

  const hasProjects = provinceInfo?.projects?.length > 0;
  const projects = provinceInfo?.projects || [];

  // Separate projects and hotels
  const actualProjects = projects.filter((p) => p.category !== "hotel");
  const hotels = projects.filter((p) => p.category === "hotel");
  const hasActualProjects = actualProjects.length > 0;
  const hasHotels = hotels.length > 0;

  // Reset selected project when modal opens or province changes
  useEffect(() => {
    if (open && hasProjects) {
      // If a specific project is requested (from marker click), select it
      if (
        selectedProjectName &&
        projects.some((p) => p.name === selectedProjectName)
      ) {
        setSelectedProject(selectedProjectName);
      } else {
        // Otherwise select the first project or hotel
        setSelectedProject(projects[0]?.name || "");
      }
    } else {
      setSelectedProject("");
    }
  }, [open, provinceInfo, hasProjects, selectedProjectName]);

  const currentProject = projects.find((p) => p.name === selectedProject);
  const hasData = currentProject?.fields?.length > 0;
  const isCurrentHotel = currentProject?.category === "hotel";

  // Create a compatible data structure for the existing components
  const compatibleProvinceInfo = currentProject
    ? {
        ...provinceInfo,
        fields: currentProject.fields,
        projectName: currentProject.name,
        projectType: currentProject.type,
      }
    : null;

  // Get appropriate label for the dropdown
  const getDropdownLabel = () => {
    if (hasActualProjects && hasHotels) {
      return "انتخاب پروژه یا اقامتگاه";
    } else if (hasHotels) {
      return "انتخاب اقامتگاه";
    } else {
      return "انتخاب پروژه";
    }
  };

  // Get appropriate empty message
  const getEmptyMessage = () => {
    if (hasActualProjects && hasHotels) {
      return "هیچ پروژه یا اقامتگاهی برای این استان ثبت نشده است";
    } else if (hasHotels && !hasActualProjects) {
      return "هیچ اقامتگاهی برای این استان ثبت نشده است";
    } else {
      return "هیچ پروژه‌ای برای این استان ثبت نشده است";
    }
  };

  const renderContent = () => (
    <Box
      sx={{
        width: isBottomLeft ? "100%" : 700,
        height: isBottomLeft ? "100%" : 650,
        bgcolor: "background.paper",
        boxShadow: isBottomLeft ? "none" : 24,
        p: isBottomLeft ? 2 : 4,
        borderRadius: isBottomLeft ? 0 : 2,
        display: "flex",
        flexDirection: "column",
        position: isBottomLeft ? "relative" : "absolute",
        top: isBottomLeft ? "auto" : "50%",
        left: isBottomLeft ? "auto" : "50%",
        transform: isBottomLeft ? "none" : "translate(-50%, -50%)",
      }}
    >
      {/* Header with close button for bottom-left version */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          mb: 2,
        }}
      >
        <Box>
          <IconButton onClick={() => setTab(0)}>
            <TableChartIcon color={tab === 0 ? "primary" : "inherit"} />
          </IconButton>
          <IconButton onClick={() => setTab(1)}>
            <PieChartIcon color={tab === 1 ? "primary" : "inherit"} />
          </IconButton>
          <IconButton onClick={() => setTab(2)}>
            <BarChartIcon color={tab === 2 ? "primary" : "inherit"} />
          </IconButton>
        </Box>
        <Typography
          variant={isBottomLeft ? "h6" : "h5"}
          component="h2"
          gutterBottom
        >
          {provinceInfo?.province?.name_fa || "استانی انتخاب نشده است"}
        </Typography>
        {isBottomLeft ? (
          <IconButton onClick={onClose} size="small">
            ✕
          </IconButton>
        ) : (
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            visibility={"hidden"}
          >
            {provinceInfo?.province?.name_fa || "استانی انتخاب نشده است"}
          </Typography>
        )}
      </Box>

      {hasProjects && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{getDropdownLabel()}</InputLabel>
          <Select
            value={selectedProject}
            label={getDropdownLabel()}
            onChange={(e) => setSelectedProject(e.target.value)}
            size={isBottomLeft ? "small" : "medium"}
          >
            {actualProjects.length > 0 && (
              <Typography
                variant="overline"
                sx={{ px: 2, color: "text.secondary" }}
              >
                پروژه‌ها
              </Typography>
            )}
            {actualProjects.map((project) => (
              <MenuItem key={project.name} value={project.name}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ConstructionIcon fontSize="small" color="primary" />
                  {project.name} - {project.type}
                </Box>
              </MenuItem>
            ))}
            {hotels.length > 0 && actualProjects.length > 0 && (
              <Typography
                variant="overline"
                sx={{ px: 2, color: "text.secondary", mt: 1 }}
              >
                اقامتگاه‌ها
              </Typography>
            )}
            {hotels.map((hotel) => (
              <MenuItem key={hotel.name} value={hotel.name}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HotelIcon fontSize="small" color="secondary" />
                  {hotel.name} - {hotel.type}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Show current selection info */}
      {currentProject && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" color="primary">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isCurrentHotel ? (
                <HotelIcon fontSize="small" color="secondary" />
              ) : (
                <ConstructionIcon fontSize="small" color="primary" />
              )}
              {isCurrentHotel ? "اقامتگاه:" : "پروژه:"}{" "}
              <strong>{currentProject.name}</strong>
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            نوع: {currentProject.type}
          </Typography>
          {isCurrentHotel && (
            <Typography variant="body2" color="text.secondary">
              وضعیت:{" "}
              <Box
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                {currentProject.isActive !== false ? (
                  <>
                    <CheckCircleIcon
                      fontSize="inherit"
                      sx={{ color: "#4CAF50" }}
                    />
                    <span
                      style={{
                        color: "#4CAF50",
                        fontWeight: "bold",
                      }}
                    >
                      فعال
                    </span>
                  </>
                ) : (
                  <>
                    <CancelIcon fontSize="inherit" sx={{ color: "#757575" }} />
                    <span
                      style={{
                        color: "#757575",
                        fontWeight: "bold",
                      }}
                    >
                      غیرفعال
                    </span>
                  </>
                )}
              </Box>
            </Typography>
          )}
        </Box>
      )}

      <Divider />
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxHeight: isBottomLeft ? "300px" : "auto",
        }}
      >
        {!hasProjects ? (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ p: 2 }}
          >
            {getEmptyMessage()}
          </Typography>
        ) : !hasData ? (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ p: 2 }}
          >
            اطلاعاتی برای این {isCurrentHotel ? "اقامتگاه" : "پروژه"} ثبت نشده
            است
          </Typography>
        ) : (
          <>
            {tab === 0 && (
              <ProvinceTable provinceInfo={compatibleProvinceInfo} />
            )}
            {tab === 1 && (
              <ProvincePieChart provinceInfo={compatibleProvinceInfo} />
            )}
            {tab === 2 && (
              <ProvinceBarChart provinceInfo={compatibleProvinceInfo} />
            )}
          </>
        )}
      </Box>
    </Box>
  );

  // Return content wrapped in Modal or as standalone box
  if (isBottomLeft) {
    return renderContent();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="province-modal"
      aria-describedby="province-modal-description"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid lightblue",
      }}
    >
      {renderContent()}
    </Modal>
  );
};

export default ProvinceInfoModal;
