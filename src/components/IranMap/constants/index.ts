export const PROJECT_TYPE_COLORS: Record<string, string> = {
  "آزادراه و بزرگراه": "#FF5722", // Deep Orange
  "راه آهن برونشهری": "#2196F3", // Blue
  "راه اصلی و فرعی": "#4CAF50", // Green
  "راه آهن شهری و حومه": "#9C27B0", // Purple
  تونل: "#795548", // Brown
  "تقاطع غیره مسطح": "#FF9800", // Orange
  ابنیه: "#607D8B", // Blue Grey
};

export const HOTEL_TYPE_COLORS: Record<string, string> = {
  ویلا: "#E91E63", // Pink
  اپارتمان: "#00BCD4", // Cyan
  هتل: "#FFC107", // Amber
  "هتل آپارتمان": "#8BC34A", // Light Green
};

export const PROJECT_TYPES = [
  "آزادراه و بزرگراه",
  "راه آهن برونشهری",
  "راه اصلی و فرعی",
  "راه آهن شهری و حومه",
  "تونل",
  "تقاطع غیره مسطح",
  "ابنیه",
];

export const HOTEL_TYPES = ["ویلا", "اپارتمان", "هتل", "هتل آپارتمان"];

export const PERSIAN_LABELS = {
  population: "جمعیت",
  area: "مساحت (کیلومتر مربع)",
  density: "تراکم جمعیت",
  manageIndexes: "مدیریت اندیس‌ها",
  logout: "خروج",
};

export const MAP_CONFIG = {
  center: [32.0, 53.0] as [number, number],
  zoom: 6,
  maxBounds: [
    [24, 43],
    [40, 64],
  ] as [[number, number], [number, number]],
  maxBoundsViscosity: 1.0,
};

export const PROJECT_ICONS: Record<string, string> = {
  "آزادراه و بزرگراه": "🛣️", // Highway/Freeway
  "راه آهن برونشهری": "🚄", // High-speed train (Intercity Railway)
  "راه اصلی و فرعی": "🚧", // Construction/Road work (Main & Secondary Roads)
  "راه آهن شهری و حومه": "🚇", // Metro/Subway (Urban Railway)
  تونل: "🕳️", // Tunnel hole
  "تقاطع غیره مسطح": "🌉", // Bridge (Grade Separation)
  ابنیه: "🏗️", // Construction crane (Buildings/Structures)
};

// Hotel emoji options - you can easily switch between these for different visual appeal
export const HOTEL_EMOJI_OPTIONS = {
  hotel: "🏨", // Classic hotel building (current)
  bed: "🛏️", // Bed icon (more minimalist)
  house: "🏠", // House (for residential stays)
  building: "🏢", // Office building (for hotel apartments)
  resort: "🏩", // Love hotel (for luxury stays)
  cabin: "🏘️", // Houses (for villa complexes)
};

export const HOTEL_ICON = HOTEL_EMOJI_OPTIONS.hotel; // Currently using classic hotel emoji
