import { useState, useMemo } from "react";
import { ProjectItem } from "../types/index.ts";

export const useFilters = (
  allProjects: ProjectItem[],
  selectedTypes: string[]
) => {
  const [showEmployees, setShowEmployees] = useState<boolean>(true);

  // Toggle employee visibility
  const toggleEmployeeVisibility = () => {
    setShowEmployees((prev) => !prev);
  };

  // Check if a project/hotel should be visible based on current filters
  const isItemVisible = useMemo(() => {
    return (item: ProjectItem) => {
      if (selectedTypes.length === 0) return true; // No filter, show all
      const typeKey = `${item.category}-${item.type}`;
      return selectedTypes.includes(typeKey);
    };
  }, [selectedTypes]);

  // Calculate total visible items
  const totalVisible = useMemo(() => {
    return allProjects.filter(isItemVisible).length;
  }, [allProjects, isItemVisible]);

  return {
    selectedTypes,
    showEmployees,
    toggleEmployeeVisibility,
    isItemVisible,
    totalVisible,
    setShowEmployees,
  };
};
