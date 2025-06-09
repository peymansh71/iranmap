import React from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import { FeatureCollection } from "geojson";
import { MAP_CONFIG } from "../../constants/index.ts";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  iranProvinces: FeatureCollection;
  iranMask: FeatureCollection;
  onEachProvince: (feature: any, layer: any) => void;
  style: (feature: any) => any;
  children?: React.ReactNode;
}

export const MapView: React.FC<MapViewProps> = ({
  iranProvinces,
  iranMask,
  onEachProvince,
  style,
  children,
}) => {
  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#f0f8ff", // Light blue background instead of tiles
      }}
      maxBounds={MAP_CONFIG.maxBounds}
      maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
    >
      {/* Remove TileLayer for offline functionality */}
      {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}

      {/* Gray mask around Iran */}
      <GeoJSON
        data={iranMask}
        style={{
          fillColor: "#e6e6e6",
          fillOpacity: 0.8,
          color: "#ccc",
          weight: 1,
        }}
      />

      {/* Iran provinces */}
      <GeoJSON
        data={iranProvinces}
        onEachFeature={onEachProvince}
        style={style}
      />

      {/* Dynamic content like markers */}
      {children}
    </MapContainer>
  );
};
