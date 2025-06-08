import React from "react";
import { Marker, Popup } from "react-leaflet";
import {
  createCustomIcon,
  createPersonIcon,
} from "../../utils/iconCreators.ts";
import {
  PROJECT_TYPE_COLORS,
  HOTEL_TYPE_COLORS,
} from "../../constants/index.ts";
import { ProjectItem, Employee } from "../../types";

interface MapMarkersProps {
  projects: ProjectItem[];
  employees: Employee[];
  showEmployees: boolean;
  isItemVisible: (item: ProjectItem) => boolean;
  onMarkerClick: (projectId: string) => void;
  provinceFeatures: any[];
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  projects,
  employees,
  showEmployees,
  isItemVisible,
  onMarkerClick,
  provinceFeatures,
}) => {
  // Calculate province center for employee markers
  const calculateProvinceCenter = (
    provinceName: string
  ): [number, number] | null => {
    const provinceFeature = provinceFeatures.find(
      (feature) =>
        feature.properties && feature.properties.name_fa === provinceName
    );

    if (!provinceFeature || !provinceFeature.geometry) return null;

    let centerLat = 0,
      centerLng = 0,
      pointCount = 0;

    if (provinceFeature.geometry.type === "Polygon") {
      const coordinates = provinceFeature.geometry.coordinates[0] as number[][];
      coordinates.forEach(([lng, lat]) => {
        centerLng += lng;
        centerLat += lat;
        pointCount++;
      });
    } else if (provinceFeature.geometry.type === "MultiPolygon") {
      provinceFeature.geometry.coordinates.forEach((polygon: any) => {
        const outerRing = polygon[0] as number[][];
        outerRing.forEach(([lng, lat]) => {
          centerLng += lng;
          centerLat += lat;
          pointCount++;
        });
      });
    }

    return pointCount > 0
      ? [centerLat / pointCount, centerLng / pointCount]
      : null;
  };

  return (
    <>
      {/* Project and Hotel markers */}
      {projects.filter(isItemVisible).map((item) => {
        const isHotel = item.category === "hotel";
        const colorMap = isHotel ? HOTEL_TYPE_COLORS : PROJECT_TYPE_COLORS;
        const iconColor = colorMap[item.type] || "#757575";

        return (
          <Marker
            key={item.id}
            position={item.coordinates}
            icon={createCustomIcon(
              iconColor,
              item.category,
              item.type,
              item.isActive
            )}
            eventHandlers={{
              click: () => onMarkerClick(item.id),
            }}
          />
        );
      })}

      {/* Employee markers */}
      {showEmployees &&
        employees.map((emp) => {
          const center = calculateProvinceCenter(emp.provinceName);
          if (!center) return null;

          return (
            <Marker
              key={`employee-${emp.provinceId}`}
              position={center}
              icon={createPersonIcon(emp.employeeCount)}
            >
              <Popup>
                <div style={{ textAlign: "center", padding: "5px" }}>
                  <strong>{emp.provinceName}</strong>
                  <br />
                  <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
                    {emp.employeeCount} نفر
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </>
  );
};
