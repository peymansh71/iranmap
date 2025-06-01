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
}) => {
  const [selectedProject, setSelectedProject] = useState("");

  const hasProjects = provinceInfo?.projects?.length > 0;
  const projects = provinceInfo?.projects || [];

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
        // Otherwise select the first project
        setSelectedProject(projects[0]?.name || "");
      }
    } else {
      setSelectedProject("");
    }
  }, [open, provinceInfo, hasProjects, selectedProjectName]);

  const currentProject = projects.find((p) => p.name === selectedProject);
  const hasData = currentProject?.fields?.length > 0;

  // Create a compatible data structure for the existing components
  const compatibleProvinceInfo = currentProject
    ? {
        ...provinceInfo,
        fields: currentProject.fields,
        projectName: currentProject.name,
        projectType: currentProject.type,
      }
    : null;

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
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 650,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
          <Typography variant="h5" component="h2" gutterBottom>
            {provinceInfo?.province?.name_fa || "استانی انتخاب نشده است"}
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            visibility={"hidden"}
          >
            {provinceInfo?.province?.name_fa || "استانی انتخاب نشده است"}
          </Typography>
        </Box>

        {hasProjects && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>انتخاب پروژه</InputLabel>
            <Select
              value={selectedProject}
              label="انتخاب پروژه"
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((project) => (
                <MenuItem key={project.name} value={project.name}>
                  {project.name} - {project.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Divider />
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!hasProjects ? (
            <Typography variant="h6" color="text.secondary" align="center">
              هیچ پروژه‌ای برای این استان ثبت نشده است
            </Typography>
          ) : !hasData ? (
            <Typography variant="h6" color="text.secondary" align="center">
              اطلاعاتی برای این پروژه ثبت نشده است
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
    </Modal>
  );
};

export default ProvinceInfoModal;
