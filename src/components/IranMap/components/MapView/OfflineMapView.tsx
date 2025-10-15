import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FeatureCollection } from "geojson";
import { MAP_CONFIG } from "../../constants/index.ts";
import "leaflet/dist/leaflet.css";

interface OfflineMapViewProps {
  iranProvinces: FeatureCollection;
  iranMask: FeatureCollection;
  onEachProvince: (feature: any, layer: any) => void;
  style: (feature: any) => any;
  children?: React.ReactNode;
  offlineMode?: boolean;
}

export const OfflineMapView: React.FC<OfflineMapViewProps> = ({
  iranProvinces,
  iranMask,
  onEachProvince,
  style,
  children,
  offlineMode = false,
}) => {
  const [isOnline, setIsOnline] = useState(!offlineMode && navigator.onLine);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(!offlineMode && true);
    const handleOffline = () => setIsOnline(false);

    if (!offlineMode) {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineMode]);

  // Test if local tiles are available
  useEffect(() => {
    const testTileUrl = "/offline-tiles/6/34/25.png"; // Sample Iran tile
    fetch(testTileUrl)
      .then((response) => {
        if (response.ok) {
          setTilesLoaded(true);
        }
      })
      .catch(() => {
        setTilesLoaded(false);
      });
  }, []);

  const getTileLayerUrl = () => {
    if (offlineMode || (!isOnline && tilesLoaded)) {
      // Use local tiles if available
      return "/offline-tiles/{z}/{x}/{y}.png";
    } else if (isOnline) {
      // Use online tiles
      return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    } else {
      // Fallback: no tiles, just show provinces
      return null;
    }
  };

  const tileUrl = getTileLayerUrl();

  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: offlineMode || !tileUrl ? "#f0f8ff" : "transparent",
      }}
      maxBounds={MAP_CONFIG.maxBounds}
      maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
    >
      {/* Base map tiles */}
      {tileUrl && (
        <TileLayer
          url={tileUrl}
          attribution={
            tileUrl.includes("openstreetmap")
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              : "Iran Map - Offline Mode"
          }
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
      )}

      {/* Background pattern for offline mode */}
      {(!tileUrl || offlineMode) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `
              linear-gradient(45deg, transparent 49%, rgba(200,220,240,0.1) 49%, rgba(200,220,240,0.1) 51%, transparent 51%),
              linear-gradient(-45deg, transparent 49%, rgba(200,220,240,0.1) 49%, rgba(200,220,240,0.1) 51%, transparent 51%)
            `,
            backgroundSize: "20px 20px",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
      )}

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
        style={(feature) => ({
          ...style(feature),
          // Enhanced styling for offline mode
          weight: offlineMode || !tileUrl ? 1.5 : style(feature).weight,
          color: offlineMode || !tileUrl ? "#2196F3" : style(feature).color,
        })}
      />

      {/* Dynamic content like markers */}
      {children}

      {/* Offline indicator */}
      {(offlineMode || (!isOnline && !tilesLoaded)) && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 193, 7, 0.9)",
            color: "#000",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          📡 حالت آفلاین
        </div>
      )}
    </MapContainer>
  );
};
