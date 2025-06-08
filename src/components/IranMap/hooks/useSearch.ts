import { useState, useCallback } from "react";
import { ProjectItem } from "../types/index.ts";

export const useSearch = (
  allProjects: ProjectItem[],
  provinceInfoList: any[]
) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ProjectItem[]>([]);

  // Search functionality
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const results = allProjects
        .filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase()) ||
            item.provinceName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 results

      setSearchResults(results);
    },
    [allProjects]
  );

  // Handle search result click
  const handleSearchResultClick = useCallback(
    (item: ProjectItem) => {
      setSearchQuery("");
      setSearchResults([]);
      // Find and open the province info modal
      const provinceInfo = provinceInfoList.find(
        (p) => p.province.name_fa === item.provinceName
      );
      if (provinceInfo) {
        // This would be handled by the parent component
        return provinceInfo;
      }
    },
    [provinceInfoList]
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch,
    handleSearchResultClick,
  };
};
