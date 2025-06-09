import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
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
      style={{ height: "100%", width: "100%" }}
      maxBounds={MAP_CONFIG.maxBounds}
      maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
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

      {/* Dynamic content like markers */}
      {children}
    </MapContainer>
  );
};
