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
import {
  IconButton,
  Box,
  Tooltip,
  Typography,
  Modal,
  Button,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import useIndexesStore from "../../store/indexesStore";
import useProvinceInfoStore from "../../store/provinceInfoStore";
import ProvinceInfoModal from "./ProvinceInfoModal.tsx";
import AddProvinceInfoModal from "./AddProvinceInfoModal.tsx";
import AddHotelModal from "./AddHotelModal.tsx";
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

const projectTypeColors: Record<string, string> = {
  "آزادراه و بزرگراه": "#FF5722", // Deep Orange
  "راه آهن برونشهری": "#2196F3", // Blue
  "راه اصلی و فرعی": "#4CAF50", // Green
  "راه آهن شهری و حومه": "#9C27B0", // Purple
  تونل: "#795548", // Brown
  "تقاطع غیره مسطح": "#FF9800", // Orange
  ابنیه: "#607D8B", // Blue Grey
};

const hotelTypeColors: Record<string, string> = {
  ویلا: "#E91E63", // Pink
  اپارتمان: "#00BCD4", // Cyan
  هتل: "#FFC107", // Amber
  "هتل آپارتمان": "#8BC34A", // Light Green
};

// Get hotel icon emoji - you can easily change this
const getHotelIcon = () => {
  // Options: 🏨 🏩 🛏️ 🏠 🏘️ 🏖️
  return "🛏️"; // Currently using hotel emoji
};

// Get project icon emoji based on project type
const getProjectIcon = (projectType: string) => {
  const projectIcons: Record<string, string> = {
    "آزادراه و بزرگراه": "🛣️", // Highway/Freeway
    "راه آهن برونشهری": "🚄", // High-speed train (Intercity Railway)
    "راه اصلی و فرعی": "🚧", // Construction/Road work (Main & Secondary Roads)
    "راه آهن شهری و حومه": "🚇", // Metro/Subway (Urban Railway)
    تونل: "🕳️", // Tunnel hole
    "تقاطع غیره مسطح": "🌉", // Bridge (Grade Separation)
    ابنیه: "🏗️", // Construction crane (Buildings/Structures)
  };

  return projectIcons[projectType] || "🏗️"; // Default to construction if type not found
};

// Create custom icons for different project/hotel types
const createCustomIcon = (
  color: string,
  category: string = "project",
  projectType?: string,
  isActive: boolean = true
) => {
  const isHotel = category === "hotel";

  if (isHotel) {
    // Use hotel emoji for hotels with active/inactive styles
    return L.divIcon({
      html: `
        <div class="hotel-marker ${
          isActive ? "active-hotel" : "inactive-hotel"
        }" style="
          font-size: 20px;
          width: 24px; 
          height: 24px; 
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          position: relative;
        ">
          ${getHotelIcon()}
          ${
            isActive
              ? '<div class="active-indicator"></div>'
              : '<div class="inactive-indicator"></div>'
          }
        </div>
      `,
      className: "custom-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  } else {
    // Use project emojis for projects
    return L.divIcon({
      html: `
        <div class="project-marker" style="
          font-size: 18px;
          width: 22px; 
          height: 22px; 
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          background-color: rgba(255,255,255,0.9);
          border-radius: 50%;
          border: 1px solid ${color};
        ">${getProjectIcon(projectType || "")}</div>
      `,
      className: "custom-marker",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }
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
  const [addHotelModalOpen, setAddHotelModalOpen] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
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
  const [hotelName, setHotelName] = useState<string>("");
  const [hotelType, setHotelType] = useState<string>("");
  const [hotelIsActive, setHotelIsActive] = useState<boolean>(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // For filtering
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

  React.useEffect(() => {
    if (!addHotelModalOpen) {
      setFields([{ label: "", value: "" }]);
      setSelectedAddProvince(null);
      setHotelName("");
      setHotelType("");
      setHotelIsActive(true);
      setClickCoordinates(null);
    }
  }, [addHotelModalOpen]);

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
    console.log(name, event);
    const provinceInfo = provinceInfoList.find(
      (p) => p.province.name_en === name
    );

    if (provinceInfo && event?.latlng) {
      setSelectedAddProvince(provinceInfo.province);
      setClickCoordinates([event.latlng.lat, event.latlng.lng]);
      setSelectionModalOpen(true);
    }
  };

  const handleOpenProjectModal = () => {
    setSelectionModalOpen(false);
    setAddModalOpen(true);
  };

  const handleOpenHotelModal = () => {
    setSelectionModalOpen(false);
    setAddHotelModalOpen(true);
  };

  const handleCloseSelectionModal = () => {
    setSelectionModalOpen(false);
    setSelectedAddProvince(null);
    setClickCoordinates(null);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setSelectedAddProvince(null);
    setProjectName("");
    setProjectType("");
    setClickCoordinates(null);
  };

  const handleCloseHotelModal = () => {
    setAddHotelModalOpen(false);
    setSelectedAddProvince(null);
    setHotelName("");
    setHotelType("");
    setHotelIsActive(true);
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
      transform: scale(1.3);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)) !important;
    }
    .hotel-marker:hover {
      transform: scale(1.3);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)) !important;
    }
    .active-hotel {
      position: relative;
    }
    .inactive-hotel {
      position: relative;
    }
    .active-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background-color: #4CAF50;
      border-radius: 50%;
      animation: blink-green 1.5s infinite;
      box-shadow: 0 0 3px rgba(76, 175, 80, 0.6);
    }
    .inactive-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background-color: #f44336;
      border-radius: 50%;
      animation: blink-red 1.5s infinite;
      box-shadow: 0 0 3px rgba(244, 67, 54, 0.6);
    }
    @keyframes blink-green {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    @keyframes blink-red {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
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
      category: "project", // Add category to distinguish from hotels
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

  const handleAddHotelInfo = () => {
    if (
      !selectedAddProvince ||
      !hotelName.trim() ||
      !hotelType.trim() ||
      !clickCoordinates
    )
      return;
    const filteredFields = fields.filter((f) => f.label && f.value !== "");
    if (filteredFields.length === 0) return;

    // Store hotel data with type, coordinates, and isActive status
    const hotelData = {
      name: hotelName.trim(),
      type: hotelType.trim(),
      coordinates: clickCoordinates,
      category: "hotel", // Add category to distinguish from projects
      isActive: hotelIsActive, // Add isActive field
    };
    addProvinceInfo(selectedAddProvince, hotelData, filteredFields);

    // Close add modal and open info modal to show the created data
    setAddHotelModalOpen(false);
    setSelectedProvince(selectedAddProvince);
    setInfoModalOpen(true);

    // Reset the add form
    setFields([{ label: "", value: "" }]);
    setSelectedAddProvince(null);
    setHotelName("");
    setHotelType("");
    setHotelIsActive(true);
    setClickCoordinates(null);
  };

  // Handle marker click to open ProvinceInfoModal with specific project
  const handleMarkerClick = (projectId: string) => {
    // Parse the projectId to get province ID and project index
    const [provinceId, projectIndex] = projectId.split("-");
    const index = parseInt(projectIndex);

    // Find the specific province first
    const provinceInfo = provinceInfoList.find(
      (info) => info.province.id === provinceId
    );

    if (provinceInfo && provinceInfo.projects[index]) {
      const project = provinceInfo.projects[index];
      // Set the selected province and project, then open info modal
      setSelectedProvince(provinceInfo.province);
      setSelectedProjectName(project.name);
      setInfoModalOpen(true);
    }
  };

  // Get all projects and hotels from all provinces to display as markers
  const allProjects = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: string;
      coordinates: [number, number];
      provinceName: string;
      category: string;
      isActive?: boolean;
    }> = [];

    provinceInfoList.forEach((provinceInfo) => {
      provinceInfo.projects.forEach((item, index) => {
        if (item.coordinates) {
          items.push({
            id: `${provinceInfo.province.id}-${index}`,
            name: item.name,
            type: item.type,
            coordinates: item.coordinates,
            provinceName: provinceInfo.province.name_fa,
            category: item.category || "project", // Default to project for backward compatibility
            isActive: item.isActive !== undefined ? item.isActive : true, // Default to active for backward compatibility
          });
        }
      });
    });

    return items;
  }, [provinceInfoList]);

  // Handle type filter toggle
  const handleTypeFilter = (type: string, category: "project" | "hotel") => {
    const typeKey = `${category}-${type}`;
    setSelectedTypes((prev) => {
      if (prev.includes(typeKey)) {
        // Remove the type (unfilter)
        return prev.filter((t) => t !== typeKey);
      } else {
        // Add the type (filter)
        return [...prev, typeKey];
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([]);
  };

  // Check if a project/hotel should be visible based on current filters
  const isItemVisible = (item: any) => {
    if (selectedTypes.length === 0) return true; // No filter, show all
    const typeKey = `${item.category}-${item.type}`;
    return selectedTypes.includes(typeKey);
  };

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

        {/* Project and Hotel markers */}
        {allProjects
          .filter(isItemVisible) // Filter based on selected types
          .map((item) => {
            const isHotel = item.category === "hotel";
            const colorMap = isHotel ? hotelTypeColors : projectTypeColors;
            const iconColor = colorMap[item.type] || "#757575";

            return (
              <Marker
                key={item.id}
                position={item.coordinates}
                icon={createCustomIcon(
                  iconColor,
                  item.category,
                  item.type,
                  item.isActive
                )}
                eventHandlers={{
                  click: () => handleMarkerClick(item.id),
                }}
              ></Marker>
            );
          })}
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

      {/* Legend for project and hotel types */}
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
            maxWidth: 280,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              راهنمای نوع پروژه‌ها و اقامتگاه‌ها
            </Typography>
            {selectedTypes.length > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={clearAllFilters}
                sx={{ fontSize: "0.7rem", minWidth: "auto", p: 0.5 }}
              >
                نمایش همه
              </Button>
            )}
          </Box>

          {/* Project Types */}
          {Object.entries(projectTypeColors).map(([type, color]) => {
            const hasProjectsOfThisType = allProjects.some(
              (p) => p.type === type && p.category !== "hotel"
            );
            if (!hasProjectsOfThisType) return null;

            const typeKey = `project-${type}`;
            const isSelected = selectedTypes.includes(typeKey);
            const isFiltered = selectedTypes.length > 0 && !isSelected;

            return (
              <Box
                key={`project-${type}`}
                onClick={() => handleTypeFilter(type, "project")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 0.5,
                  cursor: "pointer",
                  opacity: isFiltered ? 0.3 : 1,
                  backgroundColor: isSelected
                    ? "rgba(25, 118, 210, 0.1)"
                    : "transparent",
                  borderRadius: 1,
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "rgba(25, 118, 210, 0.2)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1,
                    fontSize: "14px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "50%",
                    border: `1px solid ${color}`,
                  }}
                >
                  {getProjectIcon(type)}
                </Box>
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  {type}
                </Typography>
              </Box>
            );
          })}

          {/* Hotel Types */}
          {Object.entries(hotelTypeColors).map(([type, color]) => {
            const hasHotelsOfThisType = allProjects.some(
              (p) => p.type === type && p.category === "hotel"
            );
            if (!hasHotelsOfThisType) return null;

            const typeKey = `hotel-${type}`;
            const isSelected = selectedTypes.includes(typeKey);
            const isFiltered = selectedTypes.length > 0 && !isSelected;

            return (
              <Box
                key={`hotel-${type}`}
                onClick={() => handleTypeFilter(type, "hotel")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 0.5,
                  cursor: "pointer",
                  opacity: isFiltered ? 0.3 : 1,
                  backgroundColor: isSelected
                    ? "rgba(156, 39, 176, 0.1)"
                    : "transparent",
                  borderRadius: 1,
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "rgba(156, 39, 176, 0.2)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1,
                    fontSize: "16px",
                  }}
                >
                  {getHotelIcon()}
                </Box>
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  {type}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Province Selection Modal */}
      <Modal
        open={selectionModalOpen}
        onClose={handleCloseSelectionModal}
        aria-labelledby="selection-modal"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            minWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            {selectedAddProvince?.name_fa}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            چه چیزی می‌خواهید اضافه کنید؟
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenProjectModal}
              sx={{ minWidth: 120 }}
            >
              افزودن پروژه
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenHotelModal}
              sx={{ minWidth: 120 }}
            >
              افزودن اماکن
            </Button>
          </Box>
          <Button
            onClick={handleCloseSelectionModal}
            color="error"
            sx={{ mt: 2 }}
          >
            بستن
          </Button>
        </Box>
      </Modal>

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

      <AddHotelModal
        open={addHotelModalOpen}
        onClose={handleCloseHotelModal}
        provinceList={provinceInfoList.map((info) => info.province)}
        selectedProvince={selectedAddProvince}
        setSelectedProvince={setSelectedAddProvince}
        hotelName={hotelName}
        setHotelName={setHotelName}
        hotelType={hotelType}
        setHotelType={setHotelType}
        hotelIsActive={hotelIsActive}
        setHotelIsActive={setHotelIsActive}
        fields={fields}
        onFieldChange={handleFieldChange}
        onAddField={handleAddField}
        onRemoveField={handleRemoveField}
        onSave={handleAddHotelInfo}
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
