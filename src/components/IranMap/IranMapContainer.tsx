import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { FeatureCollection } from "geojson";
import iranProvincesRaw from "./iranProvinces.json";
import iranMaskRaw from "./iranMask.json"; // The inverse mask layer
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { IconButton, Box, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import useIndexesStore from "../../store/indexesStore";
import useProvinceInfoStore from "../../store/provinceInfoStore";
import ProvinceInfoModal from "./ProvinceInfoModal.tsx";
import AddProvinceInfoModal from "./AddProvinceInfoModal.tsx";
import ManageIndexesModal from "./ManageIndexesModal.tsx";
import LogoutIcon from "@mui/icons-material/Logout";

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
  const [tab, setTab] = useState(0);
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
  const resetStore = useProvinceInfoStore((state) => state.resetStore);
  const [projectName, setProjectName] = useState<string>("");
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!addModalOpen) {
      setFields([{ label: "", value: "" }]);
      setSelectedAddProvince(null);
      setProjectName("");
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

  const handleProvinceClick = (name) => {
    const provinceInfo = provinceInfoList.find(
      (p) => p.province.name_en === name
    );

    if (provinceInfo) {
      setSelectedAddProvince(provinceInfo.province);
      setAddModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setSelectedAddProvince(null);
    setProjectName("");
  };

  const handleCloseInfoModal = () => {
    setInfoModalOpen(false);
    setSelectedProvince(null);
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
        click: () => handleProvinceClick(name),
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
  styleSheet.innerText = `.leaflet-interactive:focus { outline: none !important; }`;
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
    if (!selectedAddProvince || !projectName.trim()) return;
    const filteredFields = fields.filter((f) => f.label && f.value !== "");
    if (filteredFields.length === 0) return;

    // Store data based on both province and project name
    addProvinceInfo(
      selectedAddProvince,
      { name: projectName.trim() },
      filteredFields
    );

    // Close add modal and open info modal to show the created data
    setAddModalOpen(false);
    setSelectedProvince(selectedAddProvince);
    setInfoModalOpen(true);

    // Reset the add form
    setFields([{ label: "", value: "" }]);
    setSelectedAddProvince(null);
    setProjectName("");
  };

  React.useEffect(() => {
    resetStore();
  }, [resetStore]);

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

      <ProvinceInfoModal
        open={infoModalOpen}
        onClose={handleCloseInfoModal}
        provinceInfo={
          selectedProvince ? getProvinceInfoByName(selectedProvince.id) : null
        }
        tab={tab}
        setTab={setTab}
      />

      <AddProvinceInfoModal
        open={addModalOpen}
        onClose={handleCloseModal}
        provinceList={provinceInfoList.map((info) => info.province)}
        selectedProvince={selectedAddProvince}
        setSelectedProvince={setSelectedAddProvince}
        projectName={projectName}
        setProjectName={setProjectName}
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
