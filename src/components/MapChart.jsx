import React, { useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import iranCities from "../data/iran-cities.json";
import CityModal from "./CityModal";
import ZoomControls from "./ZoomControls";
import iranProvinces from "../data/iran-provinces.json";
import { geoCentroid } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { Box, Typography } from "@mui/material";

// Mock data: population (in thousands) for each province
const provinceData = {
  Tehran: 13900,
  Esfehan: 5120,
  Fars: 4850,
  "Razavi Khorasan": 6430,
  "East Azerbaijan": 3900,
  "West Azerbaijan": 3260,
  Khuzestan: 4700,
  Mazandaran: 3300,
  Gilan: 2530,
  Kerman: 3160,
  Kermanshah: 2000,
  "Sistan and Baluchestan": 2810,
  Alborz: 2710,
  Qom: 1300,
  Yazd: 1130,
  Hormozgan: 1770,
  Markazi: 1420,
  Ardebil: 1280,
  Bushehr: 1230,
  Zanjan: 1050,
  Kurdistan: 1600,
  Lorestan: 1760,
  Hamadan: 1750,
  "Chaharmahal and Bakhtiari": 947,
  "North Khorasan": 863,
  "South Khorasan": 768,
  Qazvin: 1270,
  Ilam: 600,
  Golestan: 1860,
  Semnan: 702,
  "Kohgiluye va Boyerahmad": 713,
};

const values = Object.values(provinceData);
const min = Math.min(...values);
const max = Math.max(...values);
const colorScale = scaleSequential()
  .domain([min, max])
  .interpolator(interpolateYlOrRd);

const MapChart = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [position, setPosition] = useState({ coordinates: [54, 32], zoom: 4 });
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);

  const handleZoomIn = useCallback(() => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }, [position.zoom]);

  const handleZoomOut = useCallback(() => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }, [position.zoom]);

  const handleMoveEnd = useCallback((position) => {
    setPosition(position);
  }, []);

  // For legend
  const legendSteps = 7;
  const legendVals = Array.from({ length: legendSteps }, (_, i) =>
    Math.round(min + ((max - min) * i) / (legendSteps - 1))
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={iranProvinces}>
            {({ geographies }) => (
              <>
                {geographies.map((geo, idx) => {
                  const name = geo.properties.name;
                  const value = provinceData[name];
                  const isHovered = hoveredProvince === geo.rsmKey;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={value ? colorScale(value) : "#EEE"}
                      stroke="#fff"
                      strokeWidth={1.5}
                      style={{
                        default: {
                          outline: "none",
                          filter: isHovered
                            ? "drop-shadow(0 0 8px #FFD700)"
                            : "",
                          cursor: "pointer",
                          transition: "filter 0.2s, fill 0.2s",
                        },
                        hover: {
                          fill: "#FFD700",
                          outline: "none",
                          filter: "drop-shadow(0 0 12px #FFD700)",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#FF5722",
                          outline: "none",
                        },
                      }}
                      onMouseEnter={() => {
                        setHoveredProvince(geo.rsmKey);
                        setHoveredValue(value);
                        setHoveredName(name);
                      }}
                      onMouseLeave={() => {
                        setHoveredProvince(null);
                        setHoveredValue(null);
                        setHoveredName(null);
                      }}
                    />
                  );
                })}
                {/* Province Labels */}
                {geographies.map((geo, idx) => {
                  const centroid = geoCentroid(geo);
                  if (
                    centroid[0] > 43 &&
                    centroid[0] < 64 &&
                    centroid[1] > 24 &&
                    centroid[1] < 40
                  ) {
                    return (
                      <Marker
                        key={geo.rsmKey + "-label"}
                        coordinates={centroid}
                      >
                        <text
                          textAnchor="middle"
                          style={{
                            fontFamily: "inherit",
                            fontSize: 10,
                            fill: "#333",
                            fontWeight: 600,
                            textShadow: "0 1px 4px #fff, 0 0px 2px #fff",
                          }}
                        >
                          {geo.properties.name}
                        </text>
                      </Marker>
                    );
                  }
                  return null;
                })}
              </>
            )}
          </Geographies>
          {/* City Markers */}
          {iranCities.map((city) => (
            <Marker key={city.city} coordinates={[city.lng, city.lat]}>
              <circle
                r={7}
                fill="#F53"
                style={{
                  cursor: "pointer",
                  stroke: "#FF5252",
                  strokeWidth: 2,
                  strokeOpacity: 0.4,
                  filter: "drop-shadow(0 0 6px #F53)",
                  opacity: 0.85,
                }}
                onClick={() => setSelectedCity(city)}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          left: 24,
          bottom: 24,
          bgcolor: "rgba(255,255,255,0.95)",
          borderRadius: 2,
          boxShadow: 2,
          px: 2,
          py: 1,
          zIndex: 1200,
          minWidth: 160,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Population (thousands)
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {legendVals.map((val, i) => (
            <Box
              key={val}
              sx={{
                width: 18,
                height: 18,
                bgcolor: colorScale(val),
                border: "1px solid #ccc",
                borderRadius: 0.5,
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="caption">{legendVals[0]}</Typography>
          <Typography variant="caption">
            {legendVals[legendVals.length - 1]}
          </Typography>
        </Box>
        {hoveredName && hoveredValue && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {hoveredName}: <b>{hoveredValue.toLocaleString()}k</b>
            </Typography>
          </Box>
        )}
      </Box>
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      {selectedCity && (
        <CityModal city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  );
};

export default MapChart;
