import React from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Hotel as HotelIcon,
  Construction as ConstructionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { ProjectItem } from "../../types";

interface SearchBarProps {
  searchQuery: string;
  searchResults: ProjectItem[];
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  onResultClick: (item: ProjectItem) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  searchResults,
  onSearch,
  onClearSearch,
  onResultClick,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "90%",
        maxWidth: 400,
      }}
    >
      <TextField
        id="search-input"
        fullWidth
        variant="outlined"
        placeholder="جستجوی پروژه، اقامتگاه یا استان... (Ctrl+F)"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        size="small"
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={onClearSearch}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            mt: 1,
            maxHeight: 300,
            overflow: "auto",
            zIndex: 1001,
          }}
        >
          {searchResults.map((item, index) => (
            <Box
              key={`${item.id}-${index}`}
              onClick={() => onResultClick(item)}
              sx={{
                p: 2,
                cursor: "pointer",
                borderBottom:
                  index < searchResults.length - 1
                    ? "1px solid rgba(0,0,0,0.05)"
                    : "none",
                "&:hover": { bgcolor: "grey.50" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {item.category === "hotel" ? (
                    <HotelIcon fontSize="small" color="secondary" />
                  ) : (
                    <ConstructionIcon fontSize="small" color="primary" />
                  )}
                  {item.name}
                </Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.type} • {item.provinceName}
                {(item.category === "hotel" || item.category === "project") && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {item.isActive ? (
                      <>
                        <CheckCircleIcon
                          fontSize="inherit"
                          sx={{ color: "#4CAF50" }}
                        />
                        <span style={{ color: "#4CAF50" }}>فعال</span>
                      </>
                    ) : (
                      <>
                        <CancelIcon
                          fontSize="inherit"
                          sx={{ color: "#f44336" }}
                        />
                        <span style={{ color: "#f44336" }}>غیرفعال</span>
                      </>
                    )}
                  </Box>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
