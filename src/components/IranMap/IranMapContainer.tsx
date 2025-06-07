import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
  TextField,
  InputAdornment,
  Chip,
  Autocomplete,
  CircularProgress,
  Skeleton,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import useIndexesStore from "../../store/indexesStore";
import useProvinceInfoStore from "../../store/provinceInfoStore";
import useEmployeeStore from "../../store/employeeStore.ts";
import ProvinceInfoModal from "./ProvinceInfoModal.tsx";
import AddProvinceInfoModal from "./AddProvinceInfoModal.tsx";
import AddHotelModal from "./AddHotelModal.tsx";
import EmployeeManagementModal from "./EmployeeManagementModal.tsx";
import ManageIndexesModal from "./ManageIndexesModal.tsx";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import GetAppIcon from "@mui/icons-material/GetApp";
import TableViewIcon from "@mui/icons-material/TableView";
import L from "leaflet";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HotelIcon from "@mui/icons-material/Hotel";
import ConstructionIcon from "@mui/icons-material/Construction";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PeopleIcon from "@mui/icons-material/People";

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
  // Options: 🏨 🏩 🛏️ �� 🏘️ 🏖️
  return "🏨"; // Using hotel emoji for better visual appeal
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
          position: relative;
        ">${getProjectIcon(projectType || "")}
          ${
            isActive
              ? '<div class="active-indicator"></div>'
              : '<div class="inactive-indicator"></div>'
          }
        </div>
      `,
      className: "custom-marker",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }
};

// Create person icon for provinces with employees
const createPersonIcon = (employeeCount: number) => {
  return L.divIcon({
    html: `
      <div class="person-marker" style="
        background-color: #4CAF50;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        position: relative;
      ">
        👤
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #FF5722;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 1px solid white;
        ">${employeeCount > 999 ? "999+" : employeeCount}</div>
      </div>
    `,
    className: "person-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
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
  const [projectIsActive, setProjectIsActive] = useState<boolean>(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // For filtering
  const [showEmployees, setShowEmployees] = useState<boolean>(true); // For employee filtering
  const [searchQuery, setSearchQuery] = useState<string>(""); // For search functionality
  const [searchResults, setSearchResults] = useState<any[]>([]); // Search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [dashboardOpen, setDashboardOpen] = useState<boolean>(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState<boolean>(false);
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
  const { employees, getTotalEmployees, getEmployeesByProvince } =
    useEmployeeStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!addModalOpen) {
      setFields([{ label: "", value: "" }]);
      setSelectedAddProvince(null);
      setProjectName("");
      setProjectType("");
      setProjectIsActive(true);
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
    setProjectIsActive(true);
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
      category: "project",
      isActive: projectIsActive,
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
    setProjectIsActive(true);
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
      category: "hotel",
      isActive: hotelIsActive,
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
    setShowEmployees(true);
  };

  // Toggle employee visibility
  const toggleEmployeeVisibility = () => {
    setShowEmployees((prev) => !prev);
  };

  // Check if a project/hotel should be visible based on current filters
  const isItemVisible = (item: any) => {
    if (selectedTypes.length === 0) return true; // No filter, show all
    const typeKey = `${item.category}-${item.type}`;
    return selectedTypes.includes(typeKey);
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = allProjects
      .filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase()) ||
          item.provinceName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results

    setSearchResults(results);
  };

  // Auto-zoom to province or search result
  const AutoZoomComponent = ({ target }: { target: any }) => {
    const map = useMap();

    useEffect(() => {
      if (target?.coordinates) {
        map.setView(target.coordinates, 10, { animate: true, duration: 1 });
      } else if (target?.province) {
        // Find province bounds and zoom to it
        const province = iranProvinces.features.find(
          (f) =>
            f.properties && f.properties.name_en === target.province.name_en
        );
        if (province?.geometry) {
          const bounds = L.geoJSON(province).getBounds();
          map.fitBounds(bounds, {
            padding: [20, 20],
            animate: true,
            duration: 1,
          });
        }
      }
    }, [map, target]);

    return null;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault();
            // Open project modal (you'd need to select a province first)
            break;
          case "h":
            e.preventDefault();
            // Open hotel modal (you'd need to select a province first)
            break;
          case "f":
            e.preventDefault();
            // Focus search
            const searchInput = document.querySelector(
              "#search-input"
            ) as HTMLInputElement;
            searchInput?.focus();
            break;
        }
      }
      if (e.key === "Escape") {
        // Close modals and dashboard
        setAddModalOpen(false);
        setAddHotelModalOpen(false);
        setInfoModalOpen(false);
        setSelectionModalOpen(false);
        setSettingsOpen(false);
        setDashboardOpen(false);
        setEmployeeModalOpen(false);
        // Clear search and filters
        setSearchQuery("");
        setSearchResults([]);
        setSelectedTypes([]);
        setShowEmployees(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle search result click
  const handleSearchResultClick = (item: any) => {
    setSearchQuery("");
    setSearchResults([]);
    // Find and open the province info modal
    const provinceInfo = provinceInfoList.find(
      (p) => p.province.name_fa === item.provinceName
    );
    if (provinceInfo) {
      setSelectedProvince(provinceInfo.province);
      setSelectedProjectName(item.name);
      setInfoModalOpen(true);
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const csvContent = [
      ["نام", "نوع", "دسته", "استان", "وضعیت", "مختصات عرض", "مختصات طول"],
      ...allProjects.map((item) => [
        item.name,
        item.type,
        item.category === "hotel" ? "اقامتگاه" : "پروژه",
        item.provinceName,
        item.isActive ? "فعال" : "غیرفعال",
        item.coordinates[0],
        item.coordinates[1],
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `iran-map-data-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("داده‌ها با موفقیت به فرمت CSV صادر شد", "success");
    setExportMenuAnchor(null);
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalProjects: allProjects.filter((p) => p.category !== "hotel").length,
      totalHotels: allProjects.filter((p) => p.category === "hotel").length,
      data: allProjects.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        provinceName: item.provinceName,
        coordinates: item.coordinates,
        isActive: item.isActive,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `iran-map-data-${new Date().toISOString().split("T")[0]}.json`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("داده‌ها با موفقیت به فرمت JSON صادر شد", "success");
    setExportMenuAnchor(null);
  };

  // Show notification
  const showNotification = (
    message: string,
    severity: "success" | "error" | "info"
  ) => {
    setNotification({ open: true, message, severity });
  };

  // Enhanced save handlers with loading states
  const handleAddProvinceInfoWithLoading = async () => {
    if (
      !selectedAddProvince ||
      !projectName.trim() ||
      !projectType.trim() ||
      !clickCoordinates
    )
      return;

    setLoading(true);

    try {
      const filteredFields = fields.filter((f) => f.label && f.value !== "");
      if (filteredFields.length === 0) {
        showNotification("حداقل یک فیلد باید تکمیل شود", "error");
        return;
      }

      // Store data with project type and coordinates
      const projectData = {
        name: projectName.trim(),
        type: projectType.trim(),
        coordinates: clickCoordinates,
        category: "project",
        isActive: projectIsActive,
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
      setProjectIsActive(true);
      setClickCoordinates(null);

      showNotification("پروژه با موفقیت اضافه شد", "success");
    } catch (error) {
      showNotification("خطا در افزودن پروژه", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotelInfoWithLoading = async () => {
    if (
      !selectedAddProvince ||
      !hotelName.trim() ||
      !hotelType.trim() ||
      !clickCoordinates
    )
      return;

    setLoading(true);

    try {
      const filteredFields = fields.filter((f) => f.label && f.value !== "");
      if (filteredFields.length === 0) {
        showNotification("حداقل یک فیلد باید تکمیل شود", "error");
        return;
      }

      // Store hotel data with type, coordinates, and isActive status
      const hotelData = {
        name: hotelName.trim(),
        type: hotelType.trim(),
        coordinates: clickCoordinates,
        category: "hotel",
        isActive: hotelIsActive,
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

      showNotification("اقامتگاه با موفقیت اضافه شد", "success");
    } catch (error) {
      showNotification("خطا در افزودن اقامتگاه", "error");
    } finally {
      setLoading(false);
    }
  };

  // Advanced statistics calculations
  const getAdvancedStats = useMemo(() => {
    const projects = allProjects.filter((p) => p.category !== "hotel");
    const hotels = allProjects.filter((p) => p.category === "hotel");
    const activeProjects = projects.filter((p) => p.isActive);
    const inactiveProjects = projects.filter((p) => !p.isActive);
    const activeHotels = hotels.filter((h) => h.isActive);
    const inactiveHotels = hotels.filter((h) => !h.isActive);

    // Province distribution
    const provinceStats = provinceInfoList.reduce((acc, provinceInfo) => {
      const provinceProjects = provinceInfo.projects.filter(
        (p) => p.category !== "hotel"
      );
      const provinceHotels = provinceInfo.projects.filter(
        (p) => p.category === "hotel"
      );
      if (provinceProjects.length > 0 || provinceHotels.length > 0) {
        acc[provinceInfo.province.name_fa] = {
          projects: provinceProjects.length,
          hotels: provinceHotels.length,
          activeHotels: provinceHotels.filter((h) => h.isActive !== false)
            .length,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    // Type distribution
    const projectTypeStats = Object.entries(projectTypeColors)
      .map(([type, color]) => ({
        type,
        color,
        count: projects.filter((p) => p.type === type).length,
      }))
      .filter((stat) => stat.count > 0);

    const hotelTypeStats = Object.entries(hotelTypeColors)
      .map(([type, color]) => ({
        type,
        color,
        count: hotels.filter((h) => h.type === type).length,
        activeCount: hotels.filter((h) => h.type === type && h.isActive).length,
      }))
      .filter((stat) => stat.count > 0);

    return {
      total: allProjects.length,
      projects: projects.length,
      hotels: hotels.length,
      activeProjects: activeProjects.length,
      inactiveProjects: inactiveProjects.length,
      activeHotels: activeHotels.length,
      inactiveHotels: inactiveHotels.length,
      employees: getTotalEmployees(),
      employeeProvinces: employees.length,
      provinceStats,
      projectTypeStats,
      hotelTypeStats,
      topProvinces: Object.entries(provinceStats)
        .sort(
          ([, a], [, b]) =>
            (a as any).projects +
            (a as any).hotels -
            ((b as any).projects + (b as any).hotels)
        )
        .reverse()
        .slice(0, 5),
    };
  }, [allProjects, provinceInfoList]);

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
        {/* Auto-zoom component - removed per user request */}

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
              />
            );
          })}

        {/* Employee markers - Person icons for provinces with employees */}
        {showEmployees &&
          employees.map((emp) => {
            // Find the province center from the GeoJSON data
            const provinceFeature = iranProvinces.features.find(
              (feature) =>
                feature.properties &&
                feature.properties.name_fa === emp.provinceName
            );

            if (!provinceFeature || !provinceFeature.geometry) return null;

            // Calculate province center (simple centroid calculation)
            let centerLat = 0,
              centerLng = 0,
              pointCount = 0;

            if (provinceFeature.geometry.type === "Polygon") {
              const coordinates = provinceFeature.geometry
                .coordinates[0] as number[][];
              coordinates.forEach(([lng, lat]) => {
                centerLng += lng;
                centerLat += lat;
                pointCount++;
              });
            } else if (provinceFeature.geometry.type === "MultiPolygon") {
              provinceFeature.geometry.coordinates.forEach((polygon) => {
                const outerRing = polygon[0] as number[][];
                outerRing.forEach(([lng, lat]) => {
                  centerLng += lng;
                  centerLat += lat;
                  pointCount++;
                });
              });
            }

            if (pointCount === 0) return null;

            const center: [number, number] = [
              centerLat / pointCount,
              centerLng / pointCount,
            ];

            return (
              <Marker
                key={`employee-${emp.provinceId}`}
                position={center}
                icon={createPersonIcon(emp.employeeCount)}
              >
                <Popup>
                  <div style={{ textAlign: "center", padding: "5px" }}>
                    <strong>{emp.provinceName}</strong>
                    <br />
                    <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
                      {emp.employeeCount} نفر
                    </span>
                  </div>
                </Popup>
              </Marker>
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

        {/* Employee Management */}
        <Tooltip title="مدیریت کارکنان">
          <IconButton
            onClick={() => setEmployeeModalOpen(true)}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "success.main", color: "white" },
            }}
          >
            <PeopleIcon />
          </IconButton>
        </Tooltip>

        {/* Export Menu */}
        <Tooltip title="دانلود داده‌ها">
          <IconButton
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            disabled={allProjects.length === 0}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        >
          <MenuItem onClick={exportToCSV}>
            <ListItemIcon>
              <TableViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={exportToJSON}>
            <ListItemIcon>
              <GetAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>JSON</ListItemText>
          </MenuItem>
        </Menu>

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

      {/* Search Bar */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "90%",
          maxWidth: 400,
        }}
      >
        <TextField
          id="search-input"
          fullWidth
          variant="outlined"
          placeholder="جستجوی پروژه، اقامتگاه یا استان... (Ctrl+F)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              mt: 1,
              maxHeight: 300,
              overflow: "auto",
              zIndex: 1001,
            }}
          >
            {searchResults.map((item, index) => (
              <Box
                key={`${item.id}-${index}`}
                onClick={() => handleSearchResultClick(item)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderBottom:
                    index < searchResults.length - 1
                      ? "1px solid rgba(0,0,0,0.05)"
                      : "none",
                  "&:hover": { bgcolor: "grey.50" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.category === "hotel" ? (
                      <HotelIcon fontSize="small" color="secondary" />
                    ) : (
                      <ConstructionIcon fontSize="small" color="primary" />
                    )}
                    {item.name}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.type} • {item.provinceName}
                  {(item.category === "hotel" ||
                    item.category === "project") && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {item.isActive ? (
                        <>
                          <CheckCircleIcon
                            fontSize="inherit"
                            sx={{ color: "#4CAF50" }}
                          />
                          <span style={{ color: "#4CAF50" }}>فعال</span>
                        </>
                      ) : (
                        <>
                          <CancelIcon
                            fontSize="inherit"
                            sx={{ color: "#f44336" }}
                          />
                          <span style={{ color: "#f44336" }}>غیرفعال</span>
                        </>
                      )}
                    </Box>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Statistics Dashboard Toggle - Top Right */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Tooltip title="داشبورد آمار">
          <IconButton
            onClick={() => setDashboardOpen(!dashboardOpen)}
            disabled={allProjects.length === 0}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <DashboardIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Dashboard - Bottom Right */}
      {dashboardOpen && (
        <>
          {/* Backdrop for click-outside-to-close */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1500,
              pointerEvents: "auto",
            }}
            onClick={() => setDashboardOpen(false)}
          />
          {/* Statistics Dashboard Box */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              width: 350,
              maxHeight: "80vh",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
              zIndex: 1501,
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dashboard Header */}
            <Box
              sx={{
                p: 2.5,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DashboardIcon />
                    داشبورد آمار
                  </Box>
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setDashboardOpen(false)}
                  sx={{ color: "white" }}
                >
                  ✕
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                آمار کلی پروژه‌ها و اقامتگاه‌ها
              </Typography>
            </Box>

            {/* Dashboard Content */}
            <Box sx={{ maxHeight: "60vh", overflow: "auto", p: 2.5 }}>
              {/* Filter Status */}
              {(selectedTypes.length > 0 || !showEmployees) && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(33, 150, 243, 0.08)",
                    borderRadius: 2,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
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
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      فیلترهای فعال (
                      {selectedTypes.length + (!showEmployees ? 1 : 0)})
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                      onClick={clearAllFilters}
                    >
                      پاک کردن همه
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {/* Project and Hotel Filter Tags */}
                    {selectedTypes.map((typeKey) => {
                      const [category, type] = typeKey.split("-");
                      const isHotel = category === "hotel";
                      return (
                        <Box
                          key={typeKey}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: isHotel
                              ? "secondary.main"
                              : "primary.main",
                            color: "white",
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const [, actualType] = typeKey.split("-");
                            handleTypeFilter(
                              actualType,
                              category as "project" | "hotel"
                            );
                          }}
                        >
                          {isHotel ? (
                            <HotelIcon fontSize="inherit" />
                          ) : (
                            <ConstructionIcon fontSize="inherit" />
                          )}
                          {type}
                          <span style={{ marginLeft: "4px" }}>✕</span>
                        </Box>
                      );
                    })}
                    {/* Employee Filter Tag */}
                    {!showEmployees && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "success.main",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowEmployees(true)}
                      >
                        <PeopleIcon fontSize="inherit" />
                        کارکنان مخفی
                        <span style={{ marginLeft: "4px" }}>✕</span>
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    نمایش {allProjects.filter(isItemVisible).length} از{" "}
                    {allProjects.length} پروژه/اقامتگاه
                    {!showEmployees && " • کارکنان مخفی"}
                  </Typography>
                </Box>
              )}

              {/* Project Status */}
              {getAdvancedStats.projects > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    وضعیت پروژه‌ها
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        {getAdvancedStats.activeProjects}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CheckCircleIcon
                            fontSize="inherit"
                            sx={{ color: "success.main" }}
                          />
                          فعال
                        </Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(244, 67, 54, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "error.main", fontWeight: 600 }}
                      >
                        {getAdvancedStats.inactiveProjects}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CancelIcon
                            fontSize="inherit"
                            sx={{ color: "error.main" }}
                          />
                          غیرفعال
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Hotel Status */}
              {getAdvancedStats.hotels > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    وضعیت اقامتگاه‌ها
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        {getAdvancedStats.activeHotels}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CheckCircleIcon
                            fontSize="inherit"
                            sx={{ color: "success.main" }}
                          />
                          فعال
                        </Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(244, 67, 54, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "error.main", fontWeight: 600 }}
                      >
                        {getAdvancedStats.inactiveHotels}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CancelIcon
                            fontSize="inherit"
                            sx={{ color: "error.main" }}
                          />
                          غیرفعال
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Employee Statistics */}
              {getAdvancedStats.employees > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      آمار کارکنان
                    </Typography>
                    {!showEmployees && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "success.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => setShowEmployees(true)}
                      >
                        نمایش کارکنان
                      </Typography>
                    )}
                  </Box>
                  <Box
                    onClick={toggleEmployeeVisibility}
                    sx={{
                      display: "flex",
                      gap: 1,
                      cursor: "pointer",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: showEmployees
                        ? "rgba(76, 175, 80, 0.1)"
                        : "transparent",
                      border: showEmployees
                        ? "1px solid rgba(76, 175, 80, 0.3)"
                        : "1px solid transparent",
                      "&:hover": {
                        bgcolor: showEmployees
                          ? "rgba(76, 175, 80, 0.15)"
                          : "rgba(0, 0, 0, 0.04)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                        opacity: showEmployees ? 1 : 0.6,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "success.main",
                          fontWeight: showEmployees ? 600 : 400,
                        }}
                      >
                        {getAdvancedStats.employees} {showEmployees && "✓"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <PeopleIcon
                            fontSize="inherit"
                            sx={{ color: "success.main" }}
                          />
                          کل کارکنان
                        </Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                        opacity: showEmployees ? 1 : 0.6,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "primary.main",
                          fontWeight: showEmployees ? 600 : 400,
                        }}
                      >
                        {getAdvancedStats.employeeProvinces}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <DashboardIcon
                            fontSize="inherit"
                            sx={{ color: "primary.main" }}
                          />
                          استان فعال
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Project Types Distribution */}
              {getAdvancedStats.projectTypeStats.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      توزیع انواع پروژه
                    </Typography>
                    {selectedTypes.some((type) =>
                      type.startsWith("project-")
                    ) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          setSelectedTypes((prev) =>
                            prev.filter((type) => !type.startsWith("project-"))
                          );
                        }}
                      >
                        پاک کردن فیلتر
                      </Typography>
                    )}
                  </Box>
                  {getAdvancedStats.projectTypeStats.map((stat) => {
                    const typeKey = `project-${stat.type}`;
                    const isFiltered = selectedTypes.includes(typeKey);

                    return (
                      <Box
                        key={stat.type}
                        onClick={() => handleTypeFilter(stat.type, "project")}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: isFiltered
                            ? "rgba(25, 118, 210, 0.1)"
                            : "transparent",
                          border: isFiltered
                            ? "1px solid rgba(25, 118, 210, 0.3)"
                            : "1px solid transparent",
                          "&:hover": {
                            bgcolor: isFiltered
                              ? "rgba(25, 118, 210, 0.15)"
                              : "rgba(0, 0, 0, 0.04)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: stat.color,
                              borderRadius: "50%",
                              mr: 1,
                              opacity: isFiltered ? 1 : 0.7,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: isFiltered ? 600 : 400,
                              color: isFiltered ? "primary.main" : "inherit",
                            }}
                          >
                            {stat.type} {isFiltered && "✓"}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isFiltered ? "primary.main" : "inherit",
                          }}
                        >
                          {stat.count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Hotel Types Distribution */}
              {getAdvancedStats.hotelTypeStats.length > 0 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      توزیع انواع اقامتگاه
                    </Typography>
                    {selectedTypes.some((type) =>
                      type.startsWith("hotel-")
                    ) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "secondary.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          setSelectedTypes((prev) =>
                            prev.filter((type) => !type.startsWith("hotel-"))
                          );
                        }}
                      >
                        پاک کردن فیلتر
                      </Typography>
                    )}
                  </Box>
                  {getAdvancedStats.hotelTypeStats.map((stat) => {
                    const typeKey = `hotel-${stat.type}`;
                    const isFiltered = selectedTypes.includes(typeKey);

                    return (
                      <Box
                        key={stat.type}
                        onClick={() => handleTypeFilter(stat.type, "hotel")}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: isFiltered
                            ? "rgba(156, 39, 176, 0.1)"
                            : "transparent",
                          border: isFiltered
                            ? "1px solid rgba(156, 39, 176, 0.3)"
                            : "1px solid transparent",
                          "&:hover": {
                            bgcolor: isFiltered
                              ? "rgba(156, 39, 176, 0.15)"
                              : "rgba(0, 0, 0, 0.04)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: stat.color,
                              borderRadius: 1,
                              mr: 1,
                              opacity: isFiltered ? 1 : 0.7,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: isFiltered ? 600 : 400,
                              color: isFiltered ? "secondary.main" : "inherit",
                            }}
                          >
                            {stat.type} {isFiltered && "✓"}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 400,
                              color: isFiltered ? "secondary.main" : "inherit",
                            }}
                          >
                            {stat.count}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </>
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

      {/* Province Information Box - Bottom Left */}
      {infoModalOpen && (
        <>
          {/* Backdrop for click-outside-to-close */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1500,
              pointerEvents: "auto",
            }}
            onClick={handleCloseInfoModal}
          />
          {/* Information Box */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              width: 400,
              maxHeight: "60vh",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
              zIndex: 1501,
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProvinceInfoModal
              open={true}
              onClose={handleCloseInfoModal}
              provinceInfo={
                selectedProvince
                  ? getProvinceInfoByName(selectedProvince.id)
                  : null
              }
              tab={tab}
              setTab={setTab}
              selectedProjectName={selectedProjectName}
              isBottomLeft={true}
            />
          </Box>
        </>
      )}

      <ProvinceInfoModal
        open={false}
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
        onSave={handleAddProvinceInfoWithLoading}
        indexes={indexes}
        projectIsActive={projectIsActive}
        setProjectIsActive={setProjectIsActive}
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
        onSave={handleAddHotelInfoWithLoading}
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

      <EmployeeManagementModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        provinces={provinceInfoList.map((info) => info.province)}
      />

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              در حال پردازش...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
