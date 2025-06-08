export interface Province {
  id: number;
  name_fa: string;
  name_en?: string;
}

export interface Field {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  provinceName: string;
  category: string;
  isActive?: boolean;
}

export interface Employee {
  provinceId: number;
  provinceName: string;
  employeeCount: number;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
}

export interface AdvancedStats {
  total: number;
  projects: number;
  hotels: number;
  activeProjects: number;
  inactiveProjects: number;
  activeHotels: number;
  inactiveHotels: number;
  employees: number;
  employeeProvinces: number;
  provinceStats: Record<string, any>;
  projectTypeStats: Array<{
    type: string;
    color: string;
    count: number;
  }>;
  hotelTypeStats: Array<{
    type: string;
    color: string;
    count: number;
    activeCount: number;
  }>;
  topProvinces: Array<[string, any]>;
}
