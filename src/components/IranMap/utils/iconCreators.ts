import L from "leaflet";
import { PROJECT_ICONS } from "../constants/index.ts";

export const getHotelIcon = () => {
  return "🛏️";
};

export const getHotelIconByType = (hotelType: string) => {
  return "🛏️";
};

export const getProjectIcon = (projectType: string) => {
  return PROJECT_ICONS[projectType] || "🏗️";
};

// Create custom icons for different project/hotel types
export const createCustomIcon = (
  color: string,
  category: string = "project",
  projectType?: string,
  isActive: boolean = true
) => {
  const isHotel = category === "hotel";

  if (isHotel) {
    return L.divIcon({
      html: `
        <div class="hotel-marker ${
          isActive ? "active-hotel" : "inactive-hotel"
        }" style="
          background-color: ${color};
          color: white;
          border-radius: 6px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 2px solid white;
          position: relative;
          transition: all 0.3s ease;
        ">
          🛏️
          ${
            isActive
              ? '<div class="active-indicator"></div>'
              : '<div class="inactive-indicator"></div>'
          }
        </div>
      `,
      className: "custom-marker hotel-box-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  } else {
    // Use styled boxes for projects too
    return L.divIcon({
      html: `
        <div class="project-marker ${
          isActive ? "active-project" : "inactive-project"
        }" style="
          background-color: ${color};
          color: white;
          border-radius: 6px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 2px solid white;
          position: relative;
          transition: all 0.3s ease;
        ">${getProjectIcon(projectType || "")}
          ${
            isActive
              ? '<div class="active-indicator"></div>'
              : '<div class="inactive-indicator"></div>'
          }
        </div>
      `,
      className: "custom-marker project-box-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }
};

// Create person icon for provinces with employees
export const createPersonIcon = (employeeCount: number) => {
  return L.divIcon({
    html: `
      <div class="person-marker" style="
        background-color: rgb(249, 252, 105);
        color: white;
        border-radius: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        position: relative;
        transition: all 0.3s ease;
      ">
        👤
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          background-color: rgb(67, 76, 5);
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: bold;
          border: 1px solid white;
        ">${employeeCount > 999 ? "999+" : employeeCount}</div>
      </div>
    `,
    className: "person-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Add CSS styles for markers
export const addMarkerStyles = () => {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .leaflet-interactive:focus { outline: none !important; }
    .project-marker:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    }
    .hotel-marker:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    }
    .person-marker:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    }
    .hotel-box-marker {
      background: transparent !important;
      border: none !important;
    }
    .project-box-marker {
      background: transparent !important;
      border: none !important;
    }
    .active-hotel, .active-project {
      position: relative;
    }
    .inactive-hotel, .inactive-project {
      position: relative;
      opacity: 0.8;
    }
    .active-indicator {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 10px;
      height: 10px;
      background-color: #4CAF50;
      border-radius: 50%;
      animation: blink-green 1.5s infinite;
      box-shadow: 0 0 4px rgba(76, 175, 80, 0.6);
      border: 1px solid white;
    }
    .inactive-indicator {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 10px;
      height: 10px;
      background-color: rgb(247, 22, 6);
      border-radius: 50%;
      animation: blink-red 1.5s infinite;
      box-shadow: 0 0 4px rgba(244, 67, 54, 0.6);
      border: 1px solid white;
    }
    @keyframes blink-green {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    @keyframes blink-red {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    .custom-marker {
      z-index: 1000;
    }
  `;
  document.head.appendChild(styleSheet);
};
