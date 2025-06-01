import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { FeatureCollection } from "geojson";
import iranProvincesRaw from "./iranProvinces.json";
import iranMaskRaw from "./iranMask.json"; // The inverse mask layer
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { IconButton, Box, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import useIndexesStore from "../../store/indexesStore";
import useProvinceInfoStore from "../../store/provinceInfoStore";
import ProvinceInfoModal from "./ProvinceInfoModal.tsx";
import AddProvinceInfoModal from "./AddProvinceInfoModal.tsx";
import ManageIndexesModal from "./ManageIndexesModal.tsx";
import LogoutIcon from "@mui/icons-material/Logout";
import L from "leaflet";

// Fix Leaflet default icon issue with webpack - safer approach
try {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
} catch (e) {
  // Icon fix failed, but app will still work
}

// Create custom icons for different project types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="project-marker" style="
        background-color: ${color}; 
        width: 20px; 
        height: 20px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3); 
        cursor: pointer;
        transition: all 0.2s ease;
      "></div>
    `,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const projectTypeColors: Record<string, string> = {
  "آزادراه و بزرگراه": "#FF5722", // Deep Orange
  "راه آهن برونشهری": "#2196F3", // Blue
  "راه اصلی و فرعی": "#4CAF50", // Green
  "راه آهن شهری و حومه": "#9C27B0", // Purple
  تونل: "#795548", // Brown
  "تقاطع غیره مسطح": "#FF9800", // Orange
  ابنیه: "#607D8B", // Blue Grey
};

// Type definitions
interface Province {
  id: number;
  name_fa: string;
  name_en?: string;
}

interface Field {
  label: string;
  value: string;
}

const iranProvinces = iranProvincesRaw as FeatureCollection;
const iranMask = iranMaskRaw as FeatureCollection;

export const IranMapContainer = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAddProvince, setSelectedAddProvince] =
    useState<Province | null>(null);
  const [fields, setFields] = useState<Field[]>([{ label: "", value: "" }]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [tab, setTab] = useState(0);
  const [projectName, setProjectName] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [clickCoordinates, setClickCoordinates] = useState<
    [number, number] | null
  >(null);
  const indexes = useIndexesStore((state) => state.indexes);
  const addIndex = useIndexesStore((state) => state.addIndex);
  const removeIndex = useIndexesStore((state) => state.removeIndex);
  const [newIndex, setNewIndex] = useState("");
  const provinceInfoList = useProvinceInfoStore(
    (state) => state.provinceInfoList
  );
  const addProvinceInfo = useProvinceInfoStore(
    (state) => state.addProvinceInfo
  );
  const getProvinceInfoByName = useProvinceInfoStore(
    (state) => state.getProvinceInfoByName
  );
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!addModalOpen) {
      setFields([{ label: "", value: "" }]);
      setSelectedAddProvince(null);
      setProjectName("");
      setProjectType("");
      setClickCoordinates(null);
    }
  }, [addModalOpen]);

  const handleFieldChange = (idx, key, val) => {
    setFields((fields) =>
      fields.map((f, i) => (i === idx ? { ...f, [key]: val } : f))
    );
  };

  const handleAddField = () => {
    setFields((fields) => [...fields, { label: "", value: "" }]);
  };

  const handleRemoveField = (idx) => {
    setFields((fields) => fields.filter((_, i) => i !== idx));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProvinceClick = (name, event) => {
    const provinceInfo = provinceInfoList.find(
      (p) => p.province.name_en === name
    );

    if (provinceInfo && event?.latlng) {
      setSelectedAddProvince(provinceInfo.province);
      setClickCoordinates([event.latlng.lat, event.latlng.lng]);
      setAddModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setSelectedAddProvince(null);
    setProjectName("");
    setProjectType("");
    setClickCoordinates(null);
  };

  const handleCloseInfoModal = () => {
    setInfoModalOpen(false);
    setSelectedProvince(null);
    setSelectedProjectName("");
  };

  const defaultStyle = useMemo(
    () => ({
      fillColor: "lightblue",
      weight: 1,
      color: "lightblue",
      fillOpacity: 0.1,
    }),
    []
  );

  const highlightStyle = useMemo(
    () => ({
      fillColor: "lightblue",
      color: "lightblue",
      weight: 2,
      fillOpacity: 0.7,
    }),
    []
  );

  const style = (feature) => {
    const name = feature.properties.name_en;
    return selectedAddProvince?.name_en === name
      ? highlightStyle
      : defaultStyle;
  };

  const onEachProvince = useCallback(
    (feature, layer) => {
      const name = feature.properties.name_en;
      layer.on({
        click: (e) => handleProvinceClick(name, e),
        mouseover: (e) => {
          e.target.setStyle({
            weight: 0,
            color: "lightblue",
            fillColor: "lightblue",
            fillOpacity: 0.7,
          });
        },
        mouseout: (e) => {
          if (selectedAddProvince?.name_en !== name) {
            e.target.setStyle(defaultStyle);
          }
        },
      });
    },
    [selectedAddProvince, defaultStyle]
  );

  const selectedProvinceInfo = useMemo(() => {
    if (!selectedAddProvince) return null;
    return getProvinceInfoByName(selectedAddProvince.id);
  }, [selectedAddProvince, getProvinceInfoByName]);

  // Persian labels
  const persianLabels = {
    population: "جمعیت",
    area: "مساحت (کیلومتر مربع)",
    density: "تراکم جمعیت",
    manageIndexes: "مدیریت اندیس‌ها",
    logout: "خروج",
  };

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .leaflet-interactive:focus { outline: none !important; }
    .project-marker:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 8px rgba(0,0,0,0.4) !important;
    }
    .custom-marker {
      z-index: 1000;
    }
  `;
  document.head.appendChild(styleSheet);

  const handleAddIndex = () => {
    if (newIndex.trim() && !indexes.includes(newIndex.trim())) {
      addIndex(newIndex.trim());
      setNewIndex("");
    }
  };
  const handleRemoveIndex = (idx) => {
    removeIndex(indexes[idx]);
  };

  const handleAddProvinceInfo = () => {
    if (
      !selectedAddProvince ||
      !projectName.trim() ||
      !projectType.trim() ||
      !clickCoordinates
    )
      return;
    const filteredFields = fields.filter((f) => f.label && f.value !== "");
    if (filteredFields.length === 0) return;

    // Store data with project type and coordinates
    const projectData = {
      name: projectName.trim(),
      type: projectType.trim(),
      coordinates: clickCoordinates,
    };
    addProvinceInfo(selectedAddProvince, projectData, filteredFields);

    // Close add modal and open info modal to show the created data
    setAddModalOpen(false);
    setSelectedProvince(selectedAddProvince);
    setInfoModalOpen(true);

    // Reset the add form
    setFields([{ label: "", value: "" }]);
    setSelectedAddProvince(null);
    setProjectName("");
    setProjectType("");
    setClickCoordinates(null);
  };

  // Handle marker click to open ProvinceInfoModal with specific project
  const handleMarkerClick = (projectId: string) => {
    // Find the project and its province
    for (const provinceInfo of provinceInfoList) {
      const projectIndex = projectId.split("-")[1];
      const project = provinceInfo.projects[parseInt(projectIndex)];
      if (project) {
        // Set the selected province and project, then open info modal
        setSelectedProvince(provinceInfo.province);
        setSelectedProjectName(project.name);
        setInfoModalOpen(true);
        break;
      }
    }
  };

  // Get all projects from all provinces to display as markers
  const allProjects = useMemo(() => {
    const projects: Array<{
      id: string;
      name: string;
      type: string;
      coordinates: [number, number];
      provinceName: string;
    }> = [];

    provinceInfoList.forEach((provinceInfo) => {
      provinceInfo.projects.forEach((project, index) => {
        if (project.coordinates) {
          projects.push({
            id: `${provinceInfo.province.id}-${index}`,
            name: project.name,
            type: project.type,
            coordinates: project.coordinates,
            provinceName: provinceInfo.province.name_fa,
          });
        }
      });
    });

    return projects;
  }, [provinceInfoList]);

  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[32.0, 53.0]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        maxBounds={[
          [24, 43],
          [40, 64],
        ]}
        maxBoundsViscosity={1.0}
      >
        {/* Base map */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Gray mask around Iran */}
        <GeoJSON
          data={iranMask}
          style={{
            fillColor: "#ccc",
            fillOpacity: 0.7,
            color: "#ccc",
            weight: 0,
          }}
        />
        {/* Iran provinces */}
        <GeoJSON
          data={iranProvinces}
          onEachFeature={onEachProvince}
          style={style}
        />

        {/* Project markers */}
        {allProjects.map((project) => (
          <Marker
            key={project.id}
            position={project.coordinates}
            icon={createCustomIcon(
              projectTypeColors[project.type] || "#757575"
            )}
            eventHandlers={{
              click: () => handleMarkerClick(project.id),
            }}
          ></Marker>
        ))}
      </MapContainer>

      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          gap: 1,
          zIndex: 1000,
        }}
      >
        <Tooltip title={persianLabels.manageIndexes}>
          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "gray", color: "white" },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={persianLabels.logout}>
          <IconButton
            onClick={handleLogout}
            sx={{
              bgcolor: "error.main",
              color: "white",
              "&:hover": { bgcolor: "white", color: "error.main" },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Legend for project types */}
      {allProjects.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
            zIndex: 1000,
            maxWidth: 250,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            راهنمای نوع پروژه‌ها
          </Typography>
          {Object.entries(projectTypeColors).map(([type, color]) => {
            const hasProjectsOfThisType = allProjects.some(
              (p) => p.type === type
            );
            if (!hasProjectsOfThisType) return null;

            return (
              <Box
                key={type}
                sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: color,
                    border: "2px solid white",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    mr: 1,
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  {type}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      <ProvinceInfoModal
        open={infoModalOpen}
        onClose={handleCloseInfoModal}
        provinceInfo={
          selectedProvince ? getProvinceInfoByName(selectedProvince.id) : null
        }
        tab={tab}
        setTab={setTab}
        selectedProjectName={selectedProjectName}
      />

      <AddProvinceInfoModal
        open={addModalOpen}
        onClose={handleCloseModal}
        provinceList={provinceInfoList.map((info) => info.province)}
        selectedProvince={selectedAddProvince}
        setSelectedProvince={setSelectedAddProvince}
        projectName={projectName}
        setProjectName={setProjectName}
        projectType={projectType}
        setProjectType={setProjectType}
        fields={fields}
        onFieldChange={handleFieldChange}
        onAddField={handleAddField}
        onRemoveField={handleRemoveField}
        onSave={handleAddProvinceInfo}
        indexes={indexes}
      />

      <ManageIndexesModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        indexes={indexes}
        newIndex={newIndex}
        setNewIndex={setNewIndex}
        onAddIndex={handleAddIndex}
        onRemoveIndex={handleRemoveIndex}
      />
    </Box>
  );
};
