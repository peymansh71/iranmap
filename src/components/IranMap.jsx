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
    return ProvinceInformation.find(
      (info) => info.province === selectedProvince
    );
  }, [selectedProvince]);

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
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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

const ProvinceInformation = [
  {
    province: "Tehran",
    name: "تهران",
    population: 14425000,
    area_km2: 12981,
    population_density: 1111,
    gdp_share_percent: 21.7,
  },
  {
    province: "Razavi Khorasan",
    name: "رضوی خراسان",
    population: 7109000,
    area_km2: 118851,
    population_density: 60,
    gdp_share_percent: 6.5,
  },
  {
    province: "Isfahan",
    name: "اصفهان",
    population: 5429000,
    area_km2: 107027,
    population_density: 51,
    gdp_share_percent: 6.3,
  },
  {
    province: "Fars",
    name: "فارس",
    population: 5136000,
    area_km2: 122608,
    population_density: 42,
    gdp_share_percent: 5.8,
  },
  {
    province: "Khuzestan",
    name: "خوزستان",
    population: 5115000,
    area_km2: 64555,
    population_density: 79,
    gdp_share_percent: 15.0,
  },
  {
    province: "East Azerbaijan",
    name: "آذربایجان شرقی",
    population: 4092000,
    area_km2: 45490,
    population_density: 90,
    gdp_share_percent: 4.5,
  },
  {
    province: "Mazandaran",
    name: "مازندران",
    population: 3415000,
    area_km2: 23756,
    population_density: 144,
    gdp_share_percent: 3.2,
  },
  {
    province: "Kerman",
    name: "کرمان",
    population: 3413000,
    area_km2: 183285,
    population_density: 19,
    gdp_share_percent: 3.5,
  },
  {
    province: "West Azerbaijan",
    name: "آذربایجان غربی",
    population: 3529000,
    area_km2: 37411,
    population_density: 94,
    gdp_share_percent: 3.0,
  },
  {
    province: "Gilan",
    name: "گیلان",
    population: 2569000,
    area_km2: 14042,
    population_density: 183,
    gdp_share_percent: 2.5,
  },
  {
    province: "Alborz",
    name: "البرز",
    population: 3028000,
    area_km2: 5833,
    population_density: 519,
    gdp_share_percent: 2.8,
  },
  {
    province: "Sistan va Baluchestan",
    name: "سیستان و بلوچستان",
    population: 3280000,
    area_km2: 181785,
    population_density: 18,
    gdp_share_percent: 1.2,
  },
  {
    province: "Hormozgan",
    name: "هرمزگان",
    population: 2018000,
    area_km2: 70697,
    population_density: 29,
    gdp_share_percent: 2.0,
  },
  {
    province: "Lorestan",
    name: "لرستان",
    population: 1792000,
    area_km2: 28494,
    population_density: 63,
    gdp_share_percent: 1.5,
  },
  {
    province: "Kermanshah",
    name: "کرمانشاه",
    population: 1999000,
    area_km2: 24998,
    population_density: 80,
    gdp_share_percent: 1.6,
  },
  {
    province: "Golestan",
    name: "گلستان",
    population: 2016000,
    area_km2: 20380,
    population_density: 99,
    gdp_share_percent: 1.4,
  },
  {
    province: "Hamedan",
    name: "همدان",
    population: 1769000,
    area_km2: 19493,
    population_density: 91,
    gdp_share_percent: 1.3,
  },
  {
    province: "Qom",
    name: "قم",
    population: 1454000,
    area_km2: 11238,
    population_density: 129,
    gdp_share_percent: 1.2,
  },
  {
    province: "Kurdistan",
    name: "کردستان",
    population: 1689000,
    area_km2: 29137,
    population_density: 58,
    gdp_share_percent: 1.1,
  },
  {
    province: "Ardabil",
    name: "اردبیل",
    population: 1299000,
    area_km2: 17800,
    population_density: 73,
    gdp_share_percent: 1.0,
  },
  {
    province: "Qazvin",
    name: "قزوین",
    population: 1346000,
    area_km2: 15821,
    population_density: 85,
    gdp_share_percent: 1.1,
  },
  {
    province: "Zanjan",
    name: "زنجان",
    population: 1119000,
    area_km2: 22164,
    population_density: 50,
    gdp_share_percent: 1.0,
  },
  {
    province: "Markazi",
    name: "مرکزی",
    population: 1472000,
    area_km2: 29127,
    population_density: 51,
    gdp_share_percent: 1.2,
  },
  {
    province: "Yazd",
    name: "یزد",
    population: 1074000,
    area_km2: 131575,
    population_density: 8,
    gdp_share_percent: 1.0,
  },
  {
    province: "Bushehr",
    name: "بوشهر",
    population: 1277000,
    area_km2: 22743,
    population_density: 56,
    gdp_share_percent: 1.5,
  },
  {
    province: "North Khorasan",
    name: "شمال خراسان",
    population: 875000,
    area_km2: 28434,
    population_density: 31,
    gdp_share_percent: 0.8,
  },
  {
    province: "South Khorasan",
    name: "جنوب خراسان",
    population: 845000,
    area_km2: 151913,
    population_density: 6,
    gdp_share_percent: 0.7,
  },
  {
    province: "Chaharmahal and Bakhtiari",
    name: "چهارمحال و بختیاری",
    population: 997000,
    area_km2: 16332,
    population_density: 61,
    gdp_share_percent: 0.9,
  },
  {
    province: "Kohgiluyeh and Boyer-Ahmad",
    name: "کهگیلویه و بویراحمد",
    population: 759000,
    area_km2: 15504,
    population_density: 49,
    gdp_share_percent: 0.6,
  },
  {
    province: "Ilam",
    name: "ایلام",
    population: 597000,
    area_km2: 19086,
    population_density: 31,
    gdp_share_percent: 0.5,
  },
  {
    province: "Semnan",
    name: "سمنان",
    population: 787000,
    area_km2: 97491,
    population_density: 8,
    gdp_share_percent: 0.7,
  },
];
