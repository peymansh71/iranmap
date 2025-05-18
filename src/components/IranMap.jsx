import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useCallback, useMemo } from "react";
import iranProvinces from "./iranProvinces.json";
import iranMask from "./iranMask.json"; // The inverse mask layer
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ReactECharts from "echarts-for-react";
import Autocomplete from "@mui/material/Autocomplete";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import useIndexesStore from "../store/indexesStore";
import useProvinceInfoStore from "../store/provinceInfoStore";

// List of 32 provinces in Persian
const provinceList = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
  "خراسان رضوی",
];

const IranMap = () => {
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

  // Reset fields when modal opens/closes or province changes
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
    setSelectedProvince(name);
    setIsModalOpen(true);
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
    return selectedProvince === name ? highlightStyle : defaultStyle;
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
          if (selectedProvince !== name) {
            e.target.setStyle(defaultStyle);
          }
        },
      });
    },
    [selectedProvince, defaultStyle]
  );

  const selectedProvinceInfo = useMemo(() => {
    if (!selectedProvince) return null;
    return getProvinceInfoByName(selectedProvince);
  }, [selectedProvince, provinceInfoList]);

  // Persian labels
  const persianLabels = {
    population: "جمعیت",
    area: "مساحت (کیلومتر مربع)",
    density: "تراکم جمعیت",
    gdp: "درصد سهم تولید ناخالص داخلی",
  };

  const pieData = selectedProvinceInfo
    ? [
        {
          value: selectedProvinceInfo.population,
          name: persianLabels.population,
        },
        { value: selectedProvinceInfo.area_km2, name: persianLabels.area },
        {
          value: selectedProvinceInfo.population_density,
          name: persianLabels.density,
        },
        {
          value: selectedProvinceInfo.gdp_share_percent,
          name: persianLabels.gdp,
        },
      ]
    : [];

  const barData = selectedProvinceInfo
    ? [
        selectedProvinceInfo.population,
        selectedProvinceInfo.area_km2,
        selectedProvinceInfo.population_density,
        selectedProvinceInfo.gdp_share_percent,
      ]
    : [];

  const barCategories = [
    persianLabels.population,
    persianLabels.area,
    persianLabels.density,
    persianLabels.gdp,
  ];

  const pieOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      left: "center",
      textStyle: {
        fontFamily: "inherit",
        width: 100,
        overflow: "truncate",
      },
      itemGap: 24,
    },
    series: [
      {
        name: "اطلاعات استان",
        type: "pie",
        radius: "60%",
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const barOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const p = params[0];
        return `${p.name}: ${p.value}`;
      },
    },
    xAxis: {
      type: "category",
      data: barCategories,
      axisLabel: { fontFamily: "inherit" },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontFamily: "inherit" },
    },
    series: [
      {
        data: barData,
        type: "bar",
        itemStyle: {
          color: "#1976d2",
        },
      },
    ],
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
    // Only keep fields with a label and a value
    const filteredFields = fields.filter((f) => f.label && f.value !== "");
    if (filteredFields.length === 0) return;
    addProvinceInfo(selectedAddProvince, filteredFields);
    setAddModalOpen(false);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          display: "flex",
          gap: "10px",
        }}
      >
        <IconButton
          onClick={() => setSettingsOpen(true)}
          color="primary"
          sx={{ background: "#fff", border: "1px solid #1976d2" }}
        >
          <SettingsIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddModalOpen(true)}
          sx={{ fontWeight: "bold", background: "#1976d2" }}
        >
          افزودن اطلاعات
        </Button>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          خروج
        </button>
      </div>

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

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
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
            width: 600,
            height: 600,
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
              {selectedProvinceInfo?.name || "استانی انتخاب نشده است"}
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              visibility={"hidden"}
            >
              {selectedProvinceInfo?.name || "استانی انتخاب نشده است"}
            </Typography>
          </Box>

          <Divider />
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {tab === 0 && selectedProvinceInfo && (
              <TableContainer component={Paper} sx={{ maxWidth: 500 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold", textAlign: "right" }}
                      >
                        شاخص
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", textAlign: "right" }}
                      >
                        مقدار
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ textAlign: "right" }}>
                        {persianLabels.population}
                      </TableCell>
                      <TableCell align="right" sx={{ textAlign: "right" }}>
                        {selectedProvinceInfo.population.toLocaleString(
                          "fa-IR"
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ textAlign: "right" }}>
                        {persianLabels.area}
                      </TableCell>
                      <TableCell align="right" sx={{ textAlign: "right" }}>
                        {selectedProvinceInfo.area_km2.toLocaleString("fa-IR")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ textAlign: "right" }}>
                        {persianLabels.density}
                      </TableCell>
                      <TableCell align="right" sx={{ textAlign: "right" }}>
                        {selectedProvinceInfo.population_density.toLocaleString(
                          "fa-IR"
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ textAlign: "right" }}>
                        {persianLabels.gdp}
                      </TableCell>
                      <TableCell align="right" sx={{ textAlign: "right" }}>
                        {selectedProvinceInfo.gdp_share_percent.toLocaleString(
                          "fa-IR"
                        )}
                        ٪
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {tab === 1 && selectedProvinceInfo && (
              <ReactECharts
                option={pieOption}
                style={{ height: "100%", width: 500 }}
              />
            )}
            {tab === 2 && selectedProvinceInfo && (
              <ReactECharts
                option={barOption}
                style={{ height: "100%", width: 500 }}
              />
            )}
          </Box>
        </Box>
      </Modal>

      {/* Add Province Information Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        aria-labelledby="add-info-modal"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            minWidth: 600,
            maxWidth: 800,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
            افزودن اطلاعات استان
          </Typography>
          <Autocomplete
            options={provinceList}
            value={selectedAddProvince}
            onChange={(_, newValue) => setSelectedAddProvince(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="انتخاب استان" variant="outlined" />
            )}
            sx={{ mb: 2 }}
            fullWidth
          />
          {selectedAddProvince && (
            <>
              {fields.map((field, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}
                >
                  <Autocomplete
                    options={indexes}
                    value={field.label}
                    onChange={(_, newValue) =>
                      handleFieldChange(idx, "label", newValue || "")
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="شاخص" variant="outlined" />
                    )}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="مقدار"
                    type="number"
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(idx, "value", e.target.value)
                    }
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveField(idx)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddField}
                sx={{ mb: 2 }}
              >
                افزودن شاخص
              </Button>
            </>
          )}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}
          >
            <Button
              onClick={handleAddProvinceInfo}
              variant="contained"
              color="primary"
            >
              ذخیره
            </Button>
            <Button onClick={() => setAddModalOpen(false)} color="error">
              بستن
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Settings Modal for managing indexes */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        aria-labelledby="settings-modal"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            minWidth: 700,
            maxWidth: 900,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
            مدیریت شاخص‌ها
          </Typography>
          {indexes.map((idx, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <TextField
                value={idx}
                disabled
                sx={{ flex: 1, backgroundColor: "#f0f0f0" }}
              />
              <IconButton onClick={() => handleRemoveIndex(i)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, mt: 2 }}>
            <TextField
              label="افزودن شاخص جدید"
              value={newIndex}
              onChange={(e) => setNewIndex(e.target.value)}
              sx={{ flex: 1 }}
            />

            <IconButton onClick={handleAddIndex} color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default IranMap;
