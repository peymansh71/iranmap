import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onCloseModals: () => void;
  onClearSearch: () => void;
  onClearFilters: () => void;
}

export const useKeyboardShortcuts = ({
  onCloseModals,
  onClearSearch,
  onClearFilters,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault();
            // Open project modal (you'd need to select a province first)
            break;
          case "h":
            e.preventDefault();
            // Open hotel modal (you'd need to select a province first)
            break;
          case "f":
            e.preventDefault();
            // Focus search
            const searchInput = document.querySelector(
              "#search-input"
            ) as HTMLInputElement;
            searchInput?.focus();
            break;
        }
      }
      if (e.key === "Escape") {
        // Close modals and dashboard
        onCloseModals();
        // Clear search and filters
        onClearSearch();
        onClearFilters();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseModals, onClearSearch, onClearFilters]);
};
