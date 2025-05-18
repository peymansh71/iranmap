import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useCallback, useMemo } from "react";
import iranProvinces from "./iranProvinces.json";
import iranMask from "./iranMask.json"; // The inverse mask layer
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { IconButton, Box, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import useIndexesStore from "../../store/indexesStore";
import useProvinceInfoStore from "../../store/provinceInfoStore";
import ProvinceInfoModal from "./ProvinceInfoModal";
import AddProvinceInfoModal from "./AddProvinceInfoModal";
import ManageIndexesModal from "./ManageIndexesModal";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";

const IranMapContainer = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAddProvince, setSelectedAddProvince] = useState(null);
  const [fields, setFields] = useState([{ label: "", value: "" }]);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  React.useEffect(() => {
    if (!addModalOpen) {
      setFields([{ label: "", value: "" }]);
      setSelectedAddProvince(null);
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
    // Find the province info from the list
    const provinceInfo = provinceInfoList.find(
      (p) => p.province.name_en === name
    );

    if (provinceInfo) {
      setSelectedProvince(provinceInfo.province);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    return selectedProvince?.name_en === name ? highlightStyle : defaultStyle;
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
          if (selectedProvince?.name_en !== name) {
            e.target.setStyle(defaultStyle);
          }
        },
      });
    },
    [selectedProvince, defaultStyle]
  );

  const selectedProvinceInfo = useMemo(() => {
    if (!selectedProvince) return null;
    return getProvinceInfoByName(selectedProvince.id);
  }, [selectedProvince, getProvinceInfoByName]);

  // Persian labels
  const persianLabels = {
    population: "جمعیت",
    area: "مساحت (کیلومتر مربع)",
    density: "تراکم جمعیت",
    manageIndexes: "مدیریت اندیس‌ها",
    addProvinceInfo: "افزودن اطلاعات استان",
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
    if (!selectedAddProvince) return;
    const filteredFields = fields.filter((f) => f.label && f.value !== "");
    if (filteredFields.length === 0) return;
    addProvinceInfo(selectedAddProvince, filteredFields);
    setAddModalOpen(false);
  };

  React.useEffect(() => {
    resetStore();
  }, [resetStore]);

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        useProvinceInfoStore.getState().fetchProvinces(),
        useIndexesStore.getState().fetchIndexes(),
      ]);
    };
    fetchData();
  }, []);

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
          right: 16,
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
        <Tooltip title={persianLabels.addProvinceInfo}>
          <IconButton
            onClick={() => setAddModalOpen(true)}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "white", color: "primary.main" },
            }}
          >
            <AddIcon />
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
        open={isModalOpen}
        onClose={handleCloseModal}
        provinceInfo={selectedProvinceInfo}
        tab={tab}
        setTab={setTab}
        persianLabels={persianLabels}
      />

      <AddProvinceInfoModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        provinceList={provinceInfoList.map((info) => info.province)}
        selectedProvince={selectedAddProvince}
        setSelectedProvince={setSelectedAddProvince}
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

export default IranMapContainer;
