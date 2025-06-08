import { useMemo } from "react";
import useProvinceInfoStore from "../../../store/provinceInfoStore.js";
import useEmployeeStore from "../../../store/employeeStore.ts";
import { ProjectItem, AdvancedStats } from "../types/index.ts";
import { PROJECT_TYPE_COLORS, HOTEL_TYPE_COLORS } from "../constants/index.ts";

export const useMapData = () => {
  const provinceInfoList = useProvinceInfoStore(
    (state) => state.provinceInfoList
  );
  const getProvinceInfoByName = useProvinceInfoStore(
    (state) => state.getProvinceInfoByName
  );
  const { employees, getTotalEmployees } = useEmployeeStore();

  // Get all projects and hotels from all provinces
  const allProjects = useMemo(() => {
    const items: ProjectItem[] = [];

    provinceInfoList.forEach((provinceInfo) => {
      provinceInfo.projects.forEach((item, index) => {
        if (item.coordinates) {
          items.push({
            id: `${provinceInfo.province.id}-${index}`,
            name: item.name,
            type: item.type,
            coordinates: item.coordinates,
            provinceName: provinceInfo.province.name_fa,
            category: item.category || "project",
            isActive: item.isActive !== undefined ? item.isActive : true,
          });
        }
      });
    });

    return items;
  }, [provinceInfoList]);

  // Advanced statistics calculations
  const stats = useMemo((): AdvancedStats => {
    const projects = allProjects.filter((p) => p.category !== "hotel");
    const hotels = allProjects.filter((p) => p.category === "hotel");
    const activeProjects = projects.filter((p) => p.isActive);
    const inactiveProjects = projects.filter((p) => !p.isActive);
    const activeHotels = hotels.filter((h) => h.isActive);
    const inactiveHotels = hotels.filter((h) => !h.isActive);

    // Province distribution
    const provinceStats = provinceInfoList.reduce((acc, provinceInfo) => {
      const provinceProjects = provinceInfo.projects.filter(
        (p) => p.category !== "hotel"
      );
      const provinceHotels = provinceInfo.projects.filter(
        (p) => p.category === "hotel"
      );
      if (provinceProjects.length > 0 || provinceHotels.length > 0) {
        acc[provinceInfo.province.name_fa] = {
          projects: provinceProjects.length,
          hotels: provinceHotels.length,
          activeHotels: provinceHotels.filter((h) => h.isActive !== false)
            .length,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    // Type distribution
    const projectTypeStats = Object.entries(PROJECT_TYPE_COLORS)
      .map(([type, color]) => ({
        type,
        color,
        count: projects.filter((p) => p.type === type).length,
      }))
      .filter((stat) => stat.count > 0);

    const hotelTypeStats = Object.entries(HOTEL_TYPE_COLORS)
      .map(([type, color]) => ({
        type,
        color,
        count: hotels.filter((h) => h.type === type).length,
        activeCount: hotels.filter((h) => h.type === type && h.isActive).length,
      }))
      .filter((stat) => stat.count > 0);

    return {
      total: allProjects.length,
      projects: projects.length,
      hotels: hotels.length,
      activeProjects: activeProjects.length,
      inactiveProjects: inactiveProjects.length,
      activeHotels: activeHotels.length,
      inactiveHotels: inactiveHotels.length,
      employees: getTotalEmployees(),
      employeeProvinces: employees.length,
      provinceStats,
      projectTypeStats,
      hotelTypeStats,
      topProvinces: Object.entries(provinceStats)
        .sort(
          ([, a], [, b]) =>
            (a as any).projects +
            (a as any).hotels -
            ((b as any).projects + (b as any).hotels)
        )
        .reverse()
        .slice(0, 5),
    };
  }, [allProjects, provinceInfoList, getTotalEmployees, employees]);

  return {
    allProjects,
    employees,
    provinceInfoList,
    getProvinceInfoByName,
    stats,
  };
};
