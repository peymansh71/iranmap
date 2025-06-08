import L from "leaflet";
import {
  PROJECT_ICONS,
  HOTEL_ICON,
  HOTEL_EMOJI_OPTIONS,
} from "../constants/index.ts";

// Get hotel icon emoji
export const getHotelIcon = () => {
  return HOTEL_ICON;
};

// Get hotel icon based on hotel type for better visual distinction
export const getHotelIconByType = (hotelType: string) => {
  switch (hotelType) {
    case "ویلا":
      return HOTEL_EMOJI_OPTIONS.cabin; // 🏘️ for villas
    case "اپارتمان":
      return HOTEL_EMOJI_OPTIONS.building; // 🏢 for apartments
    case "هتل":
      return HOTEL_EMOJI_OPTIONS.hotel; // 🏨 for hotels
    case "هتل آپارتمان":
      return HOTEL_EMOJI_OPTIONS.resort; // 🏩 for hotel apartments
    default:
      return HOTEL_EMOJI_OPTIONS.hotel; // Default to hotel emoji
  }
};

// Get project icon emoji based on project type
export const getProjectIcon = (projectType: string) => {
  return PROJECT_ICONS[projectType] || "🏗️"; // Default to construction if type not found
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
    // Use hotel emoji directly with enhanced styling for better visual appeal
    // Different emoji based on hotel type for better distinction
    const hotelEmoji = projectType
      ? getHotelIconByType(projectType)
      : getHotelIcon();

    return L.divIcon({
      html: `
        <div class="hotel-marker ${
          isActive ? "active-hotel" : "inactive-hotel"
        }" style="
          font-size: 28px;
          width: 32px; 
          height: 32px; 
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
          position: relative;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          ${hotelEmoji}
          ${
            isActive
              ? '<div class="active-indicator"></div>'
              : '<div class="inactive-indicator"></div>'
          }
        </div>
      `,
      className: "custom-marker hotel-emoji-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  } else {
    // Use project emojis for projects
    return L.divIcon({
      html: `
        <div class="project-marker" style="
          font-size: 18px;
          width: 22px; 
          height: 22px; 
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          background-color: rgba(255,255,255,0.9);
          border-radius: 50%;
          border: 1px solid ${color};
          position: relative;
        ">${getProjectIcon(projectType || "")}
          ${
            isActive
              ? '<div class="active-indicator"></div>'
              : '<div class="inactive-indicator"></div>'
          }
        </div>
      `,
      className: "custom-marker",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }
};

// Create person icon for provinces with employees
export const createPersonIcon = (employeeCount: number) => {
  return L.divIcon({
    html: `
      <div class="person-marker" style="
        background-color: #4CAF50;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        position: relative;
      ">
        👤
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #FF5722;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 1px solid white;
        ">${employeeCount > 999 ? "999+" : employeeCount}</div>
      </div>
    `,
    className: "person-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Add CSS styles for markers
export const addMarkerStyles = () => {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .leaflet-interactive:focus { outline: none !important; }
    .project-marker:hover {
      transform: scale(1.3);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)) !important;
    }
    .hotel-marker:hover {
      transform: scale(1.4);
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3)) !important;
    }
    .hotel-emoji-marker {
      background: transparent !important;
      border: none !important;
    }
    .active-hotel {
      position: relative;
    }
    .inactive-hotel {
      position: relative;
      opacity: 0.7;
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
      background-color: #f44336;
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
