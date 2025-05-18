import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useCallback, useMemo } from "react";
import iranProvinces from "./iranProvinces.json";
import iranMask from "./iranMask.json"; // The inverse mask layer

const populationData = {
  Tehran: 13900000,
  Isfahan: 5120000,
  "Khorasan Razavi": 6430000,
  // Add more provinces as needed
};

const IranMap = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);

  const defaultStyle = useMemo(
    () => ({
      fillColor: "#3498db",
      weight: 1,
      color: "#1f2d3d",
      fillOpacity: 0.1,
    }),
    []
  );

  const highlightStyle = useMemo(
    () => ({
      fillColor: "#e74c3c",
      color: "#c0392b",
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
        click: () => setSelectedProvince(name),
        mouseover: (e) => {
          e.target.setStyle({
            weight: 2,
            color: "#333",
            fillColor: "#f39c12",
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

  return (
    <MapContainer
      center={[32.0, 53.0]}
      zoom={6}
      style={{ height: "100vh", width: "100%" }}
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

      {/* Optional info panel */}
      {selectedProvince && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <strong>{selectedProvince}</strong>
          <br />
          Population:{" "}
          {populationData[selectedProvince]?.toLocaleString() || "Unknown"}
        </div>
      )}
    </MapContainer>
  );
};

export default IranMap;
