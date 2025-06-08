import { useState, useCallback, useMemo } from "react";
import { Province, Field, NotificationState } from "../types/index.ts";
import useIndexesStore from "../../../store/indexesStore.js";
import useProvinceInfoStore from "../../../store/provinceInfoStore.js";
import useEmployeeStore from "../../../store/employeeStore.ts";

export const useMapState = () => {
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addHotelModalOpen, setAddHotelModalOpen] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);

  // Form states
  const [selectedAddProvince, setSelectedAddProvince] =
    useState<Province | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [fields, setFields] = useState<Field[]>([{ label: "", value: "" }]);
  const [tab, setTab] = useState(0);

  // Project form
  const [projectName, setProjectName] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [projectIsActive, setProjectIsActive] = useState<boolean>(true);

  // Hotel form
  const [hotelName, setHotelName] = useState<string>("");
  const [hotelType, setHotelType] = useState<string>("");
  const [hotelIsActive, setHotelIsActive] = useState<boolean>(true);

  // Filter and UI states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showEmployees, setShowEmployees] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [clickCoordinates, setClickCoordinates] = useState<
    [number, number] | null
  >(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  // Index management
  const [newIndex, setNewIndex] = useState("");

  // Store hooks
  const indexes = useIndexesStore((state) => state.indexes);
  const addIndex = useIndexesStore((state) => state.addIndex);
  const removeIndex = useIndexesStore((state) => state.removeIndex);
  const provinceInfoList = useProvinceInfoStore(
    (state) => state.provinceInfoList
  );
  const addProvinceInfo = useProvinceInfoStore(
    (state) => state.addProvinceInfo
  );
  const getProvinceInfoByName = useProvinceInfoStore(
    (state) => state.getProvinceInfoByName
  );
  const { employees, getTotalEmployees } = useEmployeeStore();

  // Field management functions
  const handleFieldChange = useCallback(
    (idx: number, key: string, val: string) => {
      setFields((fields) =>
        fields.map((f, i) => (i === idx ? { ...f, [key]: val } : f))
      );
    },
    []
  );

  const handleAddField = useCallback(() => {
    setFields((fields) => [...fields, { label: "", value: "" }]);
  }, []);

  const handleRemoveField = useCallback((idx: number) => {
    setFields((fields) => fields.filter((_, i) => i !== idx));
  }, []);

  // Modal handlers
  const openProjectModal = useCallback(() => {
    setSelectionModalOpen(false);
    setAddModalOpen(true);
  }, []);

  const openHotelModal = useCallback(() => {
    setSelectionModalOpen(false);
    setAddHotelModalOpen(true);
  }, []);

  const closeSelectionModal = useCallback(() => {
    setSelectionModalOpen(false);
    setSelectedAddProvince(null);
    setClickCoordinates(null);
  }, []);

  const closeProjectModal = useCallback(() => {
    setAddModalOpen(false);
    setSelectedAddProvince(null);
    setProjectName("");
    setProjectType("");
    setProjectIsActive(true);
    setClickCoordinates(null);
  }, []);

  const closeHotelModal = useCallback(() => {
    setAddHotelModalOpen(false);
    setSelectedAddProvince(null);
    setHotelName("");
    setHotelType("");
    setHotelIsActive(true);
    setClickCoordinates(null);
  }, []);

  const closeInfoModal = useCallback(() => {
    setInfoModalOpen(false);
    setSelectedProvince(null);
    setSelectedProjectName("");
  }, []);

  // Notification handler
  const showNotification = useCallback(
    (message: string, severity: "success" | "error" | "info") => {
      setNotification({ open: true, message, severity });
    },
    []
  );

  // Index management
  const handleAddIndex = useCallback(() => {
    if (newIndex.trim() && !indexes.includes(newIndex.trim())) {
      addIndex(newIndex.trim());
      setNewIndex("");
    }
  }, [newIndex, indexes, addIndex]);

  const handleRemoveIndex = useCallback(
    (idx: number) => {
      removeIndex(indexes[idx]);
    },
    [indexes, removeIndex]
  );

  // Filter functions
  const handleTypeFilter = useCallback(
    (type: string, category: "project" | "hotel") => {
      const typeKey = `${category}-${type}`;
      setSelectedTypes((prev) => {
        if (prev.includes(typeKey)) {
          return prev.filter((t) => t !== typeKey);
        } else {
          return [...prev, typeKey];
        }
      });
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setSelectedTypes([]);
    setShowEmployees(true);
  }, []);

  const toggleEmployeeVisibility = useCallback(() => {
    setShowEmployees((prev) => !prev);
  }, []);

  // Province selection handler
  const handleProvinceClick = useCallback(
    (name: string, event: any) => {
      const provinceInfo = provinceInfoList.find(
        (p) => p.province.name_en === name
      );

      if (provinceInfo && event?.latlng) {
        setSelectedAddProvince(provinceInfo.province);
        setClickCoordinates([event.latlng.lat, event.latlng.lng]);
        setSelectionModalOpen(true);
      }
    },
    [provinceInfoList]
  );

  // Computed values
  const selectedProvinceInfo = useMemo(() => {
    if (!selectedAddProvince) return null;
    return getProvinceInfoByName(selectedAddProvince.id);
  }, [selectedAddProvince, getProvinceInfoByName]);

  return {
    // States
    modals: {
      addModalOpen,
      addHotelModalOpen,
      selectionModalOpen,
      infoModalOpen,
      settingsOpen,
      employeeModalOpen,
      dashboardOpen,
      excelImportModalOpen,
      setAddModalOpen,
      setAddHotelModalOpen,
      setSelectionModalOpen,
      setInfoModalOpen,
      setSettingsOpen,
      setEmployeeModalOpen,
      setDashboardOpen,
      setExcelImportModalOpen,
    },
    form: {
      selectedAddProvince,
      setSelectedAddProvince,
      selectedProvince,
      setSelectedProvince,
      selectedProjectName,
      setSelectedProjectName,
      fields,
      setFields,
      tab,
      setTab,
      projectName,
      setProjectName,
      projectType,
      setProjectType,
      projectIsActive,
      setProjectIsActive,
      hotelName,
      setHotelName,
      hotelType,
      setHotelType,
      hotelIsActive,
      setHotelIsActive,
    },
    ui: {
      selectedTypes,
      setSelectedTypes,
      showEmployees,
      setShowEmployees,
      searchQuery,
      setSearchQuery,
      searchResults,
      setSearchResults,
      loading,
      setLoading,
      clickCoordinates,
      setClickCoordinates,
      exportMenuAnchor,
      setExportMenuAnchor,
      notification,
      setNotification,
      newIndex,
      setNewIndex,
    },
    store: {
      indexes,
      addIndex,
      removeIndex,
      provinceInfoList,
      addProvinceInfo,
      getProvinceInfoByName,
      employees,
      getTotalEmployees,
    },
    handlers: {
      handleFieldChange,
      handleAddField,
      handleRemoveField,
      openProjectModal,
      openHotelModal,
      closeSelectionModal,
      closeProjectModal,
      closeHotelModal,
      closeInfoModal,
      showNotification,
      handleAddIndex,
      handleRemoveIndex,
      handleTypeFilter,
      clearAllFilters,
      toggleEmployeeVisibility,
      handleProvinceClick,
    },
    computed: {
      selectedProvinceInfo,
    },
  };
};
