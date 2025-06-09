import React, { useMemo, useCallback, useEffect } from "react";
import type { FeatureCollection } from "geojson";
import iranProvincesRaw from "./iranProvinces.json";
import iranMaskRaw from "./iranMask.json";
import {
  Box,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Modal,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import GetAppIcon from "@mui/icons-material/GetApp";
import TableViewIcon from "@mui/icons-material/TableView";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import ConstructionIcon from "@mui/icons-material/Construction";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";

// Components
import { MapView } from "./components/MapView/MapView.tsx";
import { MapMarkers } from "./components/MapMarkers/MapMarkers.tsx";
import { Dashboard } from "./components/Dashboard/Dashboard.tsx";
import { MapLayout } from "./components/MapLayout/MapLayout.tsx";
import ProvinceInfoModal from "./ProvinceInfoModal.tsx";
import AddProvinceInfoModal from "./AddProvinceInfoModal.tsx";
import AddHotelModal from "./AddHotelModal.tsx";
import EmployeeManagementModal from "./EmployeeManagementModal.tsx";
import ManageIndexesModal from "./ManageIndexesModal.tsx";
import ExcelImportModal from "./components/ExcelImport/ExcelImportModal.tsx";

// Hooks
import { useMapState } from "./hooks/useMapState.ts";
import { useMapActions } from "./hooks/useMapActions.ts";
import { useMapData } from "./hooks/useMapData.ts";
import { useFilters } from "./hooks/useFilters.ts";
import { useSearch } from "./hooks/useSearch.ts";

// Utils
import { addMarkerStyles } from "./utils/iconCreators.ts";

const iranProvinces = iranProvincesRaw as FeatureCollection;
const iranMask = iranMaskRaw as FeatureCollection;

export const IranMapContainer = () => {
  // Add marker styles on component mount
  useEffect(() => {
    addMarkerStyles();
  }, []);

  // Custom hooks
  const mapState = useMapState();
  const {
    allProjects,
    employees,
    provinceInfoList,
    getProvinceInfoByName,
    stats,
  } = useMapData();
  const { isItemVisible, totalVisible } = useFilters(
    allProjects,
    mapState.ui.selectedTypes
  );
  const { searchResults, handleSearch, handleSearchResultClick } = useSearch(
    allProjects,
    provinceInfoList
  );

  // Map actions
  const mapActions = useMapActions({
    selectedAddProvince: mapState.form.selectedAddProvince,
    clickCoordinates: mapState.ui.clickCoordinates,
    projectName: mapState.form.projectName,
    projectType: mapState.form.projectType,
    projectIsActive: mapState.form.projectIsActive,
    hotelName: mapState.form.hotelName,
    hotelType: mapState.form.hotelType,
    hotelIsActive: mapState.form.hotelIsActive,
    fields: mapState.form.fields,
    allProjects,
    addProvinceInfo: mapState.store.addProvinceInfo,
    setLoading: mapState.ui.setLoading,
    showNotification: mapState.handlers.showNotification,
    resetProjectForm: mapState.handlers.closeProjectModal,
    resetHotelForm: mapState.handlers.closeHotelModal,
    openInfoModal: (province) => {
      mapState.form.setSelectedProvince(province);
      mapState.modals.setInfoModalOpen(true);
    },
  });

  // Map styling
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

  const style = useCallback(
    (feature: any) => {
      const name = feature.properties.name_en;
      return mapState.form.selectedAddProvince?.name_en === name
        ? highlightStyle
        : defaultStyle;
    },
    [mapState.form.selectedAddProvince, highlightStyle, defaultStyle]
  );

  const onEachProvince = useCallback(
    (feature: any, layer: any) => {
      const name = feature.properties.name_en;
      layer.on({
        click: (e: any) => mapState.handlers.handleProvinceClick(name, e),
        mouseover: (e: any) => {
          e.target.setStyle({
            weight: 0,
            color: "lightblue",
            fillColor: "lightblue",
            fillOpacity: 0.7,
          });
        },
        mouseout: (e: any) => {
          if (mapState.form.selectedAddProvince?.name_en !== name) {
            e.target.setStyle(defaultStyle);
          }
        },
      });
    },
    [
      mapState.form.selectedAddProvince,
      defaultStyle,
      mapState.handlers.handleProvinceClick,
    ]
  );

  // Handle marker click
  const handleMarkerClick = useCallback(
    (projectId: string) => {
      const [provinceId, projectIndex] = projectId.split("-");
      const index = parseInt(projectIndex);
      const provinceInfo = provinceInfoList.find(
        (info) => info.province.id === provinceId
      );

      if (provinceInfo && provinceInfo.projects[index]) {
        const project = provinceInfo.projects[index];
        mapState.form.setSelectedProvince(provinceInfo.province);
        mapState.form.setSelectedProjectName(project.name);
        mapState.modals.setInfoModalOpen(true);
      }
    },
    [provinceInfoList, mapState.form, mapState.modals]
  );

  // Handle search result selection
  const onSearchResultClick = useCallback(
    (item: any) => {
      const provinceInfo = handleSearchResultClick(item);
      if (provinceInfo) {
        mapState.form.setSelectedProvince(provinceInfo.province);
        mapState.form.setSelectedProjectName(item.name);
        mapState.modals.setInfoModalOpen(true);
      }
    },
    [handleSearchResultClick, mapState.form, mapState.modals]
  );

  return (
    <MapLayout
      loading={mapState.ui.loading}
      notification={mapState.ui.notification}
      onNotificationClose={() =>
        mapState.ui.setNotification((prev) => ({ ...prev, open: false }))
      }
    >
      {/* Top Left Controls */}
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
        <Tooltip title="خروج">
          <IconButton
            onClick={mapActions.handleLogout}
            sx={{
              bgcolor: "error.main",
              color: "white",
              "&:hover": { bgcolor: "white", color: "error.main" },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
        {/* <Tooltip title="مدیریت اندیس‌ها">
          <IconButton
            onClick={() => mapState.modals.setSettingsOpen(true)}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "gray", color: "white" },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip> */}

        <Tooltip title="مدیریت نیروها">
          <IconButton
            onClick={() => mapState.modals.setEmployeeModalOpen(true)}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "success.main", color: "white" },
            }}
          >
            <PeopleIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="بارگذاری فایل Excel">
          <IconButton
            onClick={() => mapState.modals.setExcelImportModalOpen(true)}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "info.main", color: "white" },
            }}
          >
            <UploadFileIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="دانلود داده‌ها">
          <IconButton
            onClick={(e) => mapState.ui.setExportMenuAnchor(e.currentTarget)}
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
          anchorEl={mapState.ui.exportMenuAnchor}
          open={Boolean(mapState.ui.exportMenuAnchor)}
          onClose={() => mapState.ui.setExportMenuAnchor(null)}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        >
          <MenuItem onClick={mapActions.exportToCSV}>
            <ListItemIcon>
              <TableViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={mapActions.exportToJSON}>
            <ListItemIcon>
              <GetAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>JSON</ListItemText>
          </MenuItem>
        </Menu>
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
          value={mapState.ui.searchQuery}
          onChange={(e) => {
            mapState.ui.setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
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
            endAdornment: mapState.ui.searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    mapState.ui.setSearchQuery("");
                    mapState.ui.setSearchResults([]);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Search Results */}
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
                onClick={() => onSearchResultClick(item)}
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
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Main Map */}
      <MapView
        iranProvinces={iranProvinces}
        iranMask={iranMask}
        onEachProvince={onEachProvince}
        style={style}
      >
        <MapMarkers
          projects={allProjects}
          employees={employees}
          showEmployees={mapState.ui.showEmployees}
          isItemVisible={isItemVisible}
          onMarkerClick={handleMarkerClick}
          provinceFeatures={iranProvinces.features}
        />
      </MapView>

      {/* Dashboard */}
      <Dashboard
        isOpen={mapState.modals.dashboardOpen}
        onToggle={() =>
          mapState.modals.setDashboardOpen(!mapState.modals.dashboardOpen)
        }
        onClose={() => mapState.modals.setDashboardOpen(false)}
        stats={stats}
        selectedTypes={mapState.ui.selectedTypes}
        showEmployees={mapState.ui.showEmployees}
        onTypeFilter={mapState.handlers.handleTypeFilter}
        onClearAllFilters={mapState.handlers.clearAllFilters}
        onToggleEmployeeVisibility={mapState.handlers.toggleEmployeeVisibility}
        totalVisible={totalVisible}
        totalItems={allProjects.length}
      />

      {/* Selection Modal */}
      <Modal
        open={mapState.modals.selectionModalOpen}
        onClose={mapState.handlers.closeSelectionModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            minWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            {mapState.form.selectedAddProvince?.name_fa}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            چه چیزی می‌خواهید اضافه کنید؟
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={mapState.handlers.openProjectModal}
              sx={{ minWidth: 120 }}
            >
              افزودن پروژه
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={mapState.handlers.openHotelModal}
              sx={{ minWidth: 120 }}
            >
              افزودن اماکن
            </Button>
          </Box>
          <Button
            onClick={mapState.handlers.closeSelectionModal}
            color="error"
            sx={{ mt: 2 }}
          >
            بستن
          </Button>
        </Box>
      </Modal>

      {/* Modals */}
      <ProvinceInfoModal
        open={mapState.modals.infoModalOpen}
        onClose={mapState.handlers.closeInfoModal}
        provinceInfo={
          mapState.form.selectedProvince
            ? getProvinceInfoByName(mapState.form.selectedProvince.id)
            : null
        }
        tab={mapState.form.tab}
        setTab={mapState.form.setTab}
        selectedProjectName={mapState.form.selectedProjectName}
      />

      <AddProvinceInfoModal
        open={mapState.modals.addModalOpen}
        onClose={mapState.handlers.closeProjectModal}
        provinceList={provinceInfoList.map((info) => info.province)}
        selectedProvince={mapState.form.selectedAddProvince}
        setSelectedProvince={mapState.form.setSelectedAddProvince}
        projectName={mapState.form.projectName}
        setProjectName={mapState.form.setProjectName}
        projectType={mapState.form.projectType}
        setProjectType={mapState.form.setProjectType}
        fields={mapState.form.fields}
        onFieldChange={mapState.handlers.handleFieldChange}
        onAddField={mapState.handlers.handleAddField}
        onRemoveField={mapState.handlers.handleRemoveField}
        onSave={mapActions.handleAddProject}
        indexes={mapState.store.indexes}
        projectIsActive={mapState.form.projectIsActive}
        setProjectIsActive={mapState.form.setProjectIsActive}
      />

      <AddHotelModal
        open={mapState.modals.addHotelModalOpen}
        onClose={mapState.handlers.closeHotelModal}
        provinceList={provinceInfoList.map((info) => info.province)}
        selectedProvince={mapState.form.selectedAddProvince}
        setSelectedProvince={mapState.form.setSelectedAddProvince}
        hotelName={mapState.form.hotelName}
        setHotelName={mapState.form.setHotelName}
        hotelType={mapState.form.hotelType}
        setHotelType={mapState.form.setHotelType}
        hotelIsActive={mapState.form.hotelIsActive}
        setHotelIsActive={mapState.form.setHotelIsActive}
        fields={mapState.form.fields}
        onFieldChange={mapState.handlers.handleFieldChange}
        onAddField={mapState.handlers.handleAddField}
        onRemoveField={mapState.handlers.handleRemoveField}
        onSave={mapActions.handleAddHotel}
      />

      <ManageIndexesModal
        open={mapState.modals.settingsOpen}
        onClose={() => mapState.modals.setSettingsOpen(false)}
        indexes={mapState.store.indexes}
        newIndex={mapState.ui.newIndex}
        setNewIndex={mapState.ui.setNewIndex}
        onAddIndex={mapState.handlers.handleAddIndex}
        onRemoveIndex={mapState.handlers.handleRemoveIndex}
      />

      <EmployeeManagementModal
        open={mapState.modals.employeeModalOpen}
        onClose={() => mapState.modals.setEmployeeModalOpen(false)}
        provinces={provinceInfoList.map((info) => info.province)}
      />

      <ExcelImportModal
        open={mapState.modals.excelImportModalOpen}
        onClose={() => mapState.modals.setExcelImportModalOpen(false)}
        onImportComplete={mapState.handlers.showNotification}
      />
    </MapLayout>
  );
};
