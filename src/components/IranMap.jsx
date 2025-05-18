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
} from "@mui/material";

const populationData = {
  Tehran: 13900000,
  Isfahan: 5120000,
  "Khorasan Razavi": 6430000,
  // Add more provinces as needed
};

const IranMap = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProvinceClick = (name) => {
    console.log(name);
    setSelectedProvince(name);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      const population = populationData[name] || "Unknown";

      layer.bindTooltip(`${name}: ${population.toLocaleString()}`, {
        sticky: true,
        direction: "top",
      });

      layer.on({
        click: () => handleProvinceClick(name),
        mouseover: (e) => {
          e.target.setStyle({
            weight: 2,
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
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            {selectedProvince} Information
          </Typography>
          {selectedProvinceInfo && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Population</TableCell>
                    <TableCell align="right">
                      {selectedProvinceInfo.population.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Area (km²)</TableCell>
                    <TableCell align="right">
                      {selectedProvinceInfo.area_km2.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Population Density</TableCell>
                    <TableCell align="right">
                      {selectedProvinceInfo.population_density.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>GDP Share (%)</TableCell>
                    <TableCell align="right">
                      {selectedProvinceInfo.gdp_share_percent}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default IranMap;

const ProvinceInformation = [
  {
    province: "Tehran",
    population: 14425000,
    area_km2: 12981,
    population_density: 1111,
    gdp_share_percent: 21.7,
  },
  {
    province: "Razavi Khorasan",
    population: 7109000,
    area_km2: 118851,
    population_density: 60,
    gdp_share_percent: 6.5,
  },
  {
    province: "Isfahan",
    population: 5429000,
    area_km2: 107027,
    population_density: 51,
    gdp_share_percent: 6.3,
  },
  {
    province: "Fars",
    population: 5136000,
    area_km2: 122608,
    population_density: 42,
    gdp_share_percent: 5.8,
  },
  {
    province: "Khuzestan",
    population: 5115000,
    area_km2: 64555,
    population_density: 79,
    gdp_share_percent: 15.0,
  },
  {
    province: "East Azerbaijan",
    population: 4092000,
    area_km2: 45490,
    population_density: 90,
    gdp_share_percent: 4.5,
  },
  {
    province: "Mazandaran",
    population: 3415000,
    area_km2: 23756,
    population_density: 144,
    gdp_share_percent: 3.2,
  },
  {
    province: "Kerman",
    population: 3413000,
    area_km2: 183285,
    population_density: 19,
    gdp_share_percent: 3.5,
  },
  {
    province: "West Azerbaijan",
    population: 3529000,
    area_km2: 37411,
    population_density: 94,
    gdp_share_percent: 3.0,
  },
  {
    province: "Gilan",
    population: 2569000,
    area_km2: 14042,
    population_density: 183,
    gdp_share_percent: 2.5,
  },
  {
    province: "Alborz",
    population: 3028000,
    area_km2: 5833,
    population_density: 519,
    gdp_share_percent: 2.8,
  },
  {
    province: "Sistan va Baluchestan",
    population: 3280000,
    area_km2: 181785,
    population_density: 18,
    gdp_share_percent: 1.2,
  },
  {
    province: "Hormozgan",
    population: 2018000,
    area_km2: 70697,
    population_density: 29,
    gdp_share_percent: 2.0,
  },
  {
    province: "Lorestan",
    population: 1792000,
    area_km2: 28494,
    population_density: 63,
    gdp_share_percent: 1.5,
  },
  {
    province: "Kermanshah",
    population: 1999000,
    area_km2: 24998,
    population_density: 80,
    gdp_share_percent: 1.6,
  },
  {
    province: "Golestan",
    population: 2016000,
    area_km2: 20380,
    population_density: 99,
    gdp_share_percent: 1.4,
  },
  {
    province: "Hamedan",
    population: 1769000,
    area_km2: 19493,
    population_density: 91,
    gdp_share_percent: 1.3,
  },
  {
    province: "Qom",
    population: 1454000,
    area_km2: 11238,
    population_density: 129,
    gdp_share_percent: 1.2,
  },
  {
    province: "Kurdistan",
    population: 1689000,
    area_km2: 29137,
    population_density: 58,
    gdp_share_percent: 1.1,
  },
  {
    province: "Ardabil",
    population: 1299000,
    area_km2: 17800,
    population_density: 73,
    gdp_share_percent: 1.0,
  },
  {
    province: "Qazvin",
    population: 1346000,
    area_km2: 15821,
    population_density: 85,
    gdp_share_percent: 1.1,
  },
  {
    province: "Zanjan",
    population: 1119000,
    area_km2: 22164,
    population_density: 50,
    gdp_share_percent: 1.0,
  },
  {
    province: "Markazi",
    population: 1472000,
    area_km2: 29127,
    population_density: 51,
    gdp_share_percent: 1.2,
  },
  {
    province: "Yazd",
    population: 1074000,
    area_km2: 131575,
    population_density: 8,
    gdp_share_percent: 1.0,
  },
  {
    province: "Bushehr",
    population: 1277000,
    area_km2: 22743,
    population_density: 56,
    gdp_share_percent: 1.5,
  },
  {
    province: "North Khorasan",
    population: 875000,
    area_km2: 28434,
    population_density: 31,
    gdp_share_percent: 0.8,
  },
  {
    province: "South Khorasan",
    population: 845000,
    area_km2: 151913,
    population_density: 6,
    gdp_share_percent: 0.7,
  },
  {
    province: "Chaharmahal and Bakhtiari",
    population: 997000,
    area_km2: 16332,
    population_density: 61,
    gdp_share_percent: 0.9,
  },
  {
    province: "Kohgiluyeh and Boyer-Ahmad",
    population: 759000,
    area_km2: 15504,
    population_density: 49,
    gdp_share_percent: 0.6,
  },
  {
    province: "Ilam",
    population: 597000,
    area_km2: 19086,
    population_density: 31,
    gdp_share_percent: 0.5,
  },
  {
    province: "Semnan",
    population: 787000,
    area_km2: 97491,
    population_density: 8,
    gdp_share_percent: 0.7,
  },
];
