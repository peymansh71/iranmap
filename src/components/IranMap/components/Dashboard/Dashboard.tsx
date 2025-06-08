import React, { useState } from "react";
import { Box, Typography, IconButton, Tooltip, Collapse } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { AdvancedStats } from "../../types";
import LastImportStatus from "./LastImportStatus.tsx";

interface DashboardProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  stats: AdvancedStats;
  selectedTypes: string[];
  showEmployees: boolean;
  onTypeFilter: (type: string, category: "project" | "hotel") => void;
  onClearAllFilters: () => void;
  onToggleEmployeeVisibility: () => void;
  totalVisible: number;
  totalItems: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isOpen,
  onToggle,
  onClose,
  stats,
  selectedTypes,
  showEmployees,
  onTypeFilter,
  onClearAllFilters,
  onToggleEmployeeVisibility,
  totalVisible,
  totalItems,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    projectTypes: false,
    hotelTypes: false,
    importStatus: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      {/* Dashboard Toggle Button */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Tooltip title="داشبورد آمار">
          <IconButton
            onClick={onToggle}
            disabled={totalItems === 0}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <DashboardIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Dashboard Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1500,
              pointerEvents: "auto",
            }}
            onClick={onClose}
          />

          {/* Dashboard Content */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              width: 350,
              maxHeight: "85vh",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
              zIndex: 1501,
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DashboardIcon />
                    داشبورد آمار
                  </Box>
                </Typography>
                <IconButton
                  size="small"
                  onClick={onClose}
                  sx={{ color: "white" }}
                >
                  ✕
                </IconButton>
              </Box>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.5, fontSize: "0.8rem" }}
              >
                آمار کلی و وضعیت به‌روزرسانی
              </Typography>
            </Box>

            {/* Content */}
            <Box
              sx={{ maxHeight: "calc(85vh - 80px)", overflow: "auto", p: 2 }}
            >
              {/* Import Status - Collapsible */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                  }}
                  onClick={() => toggleSection("importStatus")}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                  >
                    📊 آخرین به‌روزرسانی
                  </Typography>
                  {expandedSections.importStatus ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedSections.importStatus}>
                  <LastImportStatus />
                </Collapse>
              </Box>

              {/* Filter Status - Compact */}
              {(selectedTypes.length > 0 || !showEmployees) && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    bgcolor: "rgba(33, 150, 243, 0.05)",
                    borderRadius: 2,
                    border: "1px solid rgba(33, 150, 243, 0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "primary.main",
                        fontSize: "0.85rem",
                      }}
                    >
                      🔍 فیلترهای فعال (
                      {selectedTypes.length + (!showEmployees ? 1 : 0)})
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                      onClick={onClearAllFilters}
                    >
                      پاک کردن همه
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    نمایش {totalVisible} از {totalItems} مورد
                    {!showEmployees && " • نیروها مخفی"}
                  </Typography>
                </Box>
              )}

              {/* Quick Stats - Compact Row */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                {/* Projects */}
                {stats.projects > 0 && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "rgba(33, 150, 243, 0.05)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {stats.projects}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        پروژه
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "success.main", fontSize: "0.65rem" }}
                        >
                          ✓{stats.activeProjects}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "error.main", fontSize: "0.65rem" }}
                        >
                          ✕{stats.inactiveProjects}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Hotels */}
                {stats.hotels > 0 && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "rgba(156, 39, 176, 0.05)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "secondary.main",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {stats.hotels}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        اقامتگاه
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "success.main", fontSize: "0.65rem" }}
                        >
                          ✓{stats.activeHotels}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "error.main", fontSize: "0.65rem" }}
                        >
                          ✕{stats.inactiveHotels}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Employees */}
                {stats.employees > 0 && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      onClick={onToggleEmployeeVisibility}
                      sx={{
                        p: 1.5,
                        bgcolor: showEmployees
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(76, 175, 80, 0.05)",
                        borderRadius: 2,
                        textAlign: "center",
                        cursor: "pointer",
                        border: showEmployees
                          ? "1px solid rgba(76, 175, 80, 0.3)"
                          : "1px solid transparent",
                        "&:hover": { bgcolor: "rgba(76, 175, 80, 0.1)" },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "success.main",
                          fontWeight: showEmployees ? 600 : 400,
                          fontSize: "1rem",
                        }}
                      >
                        {stats.employees}
                        {showEmployees && " ✓"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        نیرو
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "primary.main",
                          fontSize: "0.65rem",
                          display: "block",
                        }}
                      >
                        {stats.employeeProvinces} استان
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Project Types Distribution - Collapsible */}
              {stats.projectTypeStats.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      p: 1,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}
                    onClick={() => toggleSection("projectTypes")}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      🏗️ انواع پروژه ({stats.projectTypeStats.length})
                    </Typography>
                    {expandedSections.projectTypes ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </Box>
                  <Collapse in={expandedSections.projectTypes}>
                    <Box sx={{ px: 1 }}>
                      {stats.projectTypeStats.map((stat) => {
                        const typeKey = `project-${stat.type}`;
                        const isFiltered = selectedTypes.includes(typeKey);

                        return (
                          <Box
                            key={stat.type}
                            onClick={() => onTypeFilter(stat.type, "project")}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                              p: 0.8,
                              borderRadius: 1,
                              cursor: "pointer",
                              bgcolor: isFiltered
                                ? "rgba(25, 118, 210, 0.1)"
                                : "transparent",
                              border: isFiltered
                                ? "1px solid rgba(25, 118, 210, 0.3)"
                                : "1px solid transparent",
                              "&:hover": {
                                bgcolor: isFiltered
                                  ? "rgba(25, 118, 210, 0.15)"
                                  : "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  backgroundColor: stat.color,
                                  borderRadius: "50%",
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: isFiltered ? 600 : 400,
                                  color: isFiltered
                                    ? "primary.main"
                                    : "inherit",
                                }}
                              >
                                {stat.type} {isFiltered && "✓"}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                color: isFiltered ? "primary.main" : "inherit",
                              }}
                            >
                              {stat.count}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* Hotel Types Distribution - Collapsible */}
              {stats.hotelTypeStats.length > 0 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      p: 1,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}
                    onClick={() => toggleSection("hotelTypes")}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      🏨 انواع اقامتگاه ({stats.hotelTypeStats.length})
                    </Typography>
                    {expandedSections.hotelTypes ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </Box>
                  <Collapse in={expandedSections.hotelTypes}>
                    <Box sx={{ px: 1 }}>
                      {stats.hotelTypeStats.map((stat) => {
                        const typeKey = `hotel-${stat.type}`;
                        const isFiltered = selectedTypes.includes(typeKey);

                        return (
                          <Box
                            key={stat.type}
                            onClick={() => onTypeFilter(stat.type, "hotel")}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                              p: 0.8,
                              borderRadius: 1,
                              cursor: "pointer",
                              bgcolor: isFiltered
                                ? "rgba(156, 39, 176, 0.1)"
                                : "transparent",
                              border: isFiltered
                                ? "1px solid rgba(156, 39, 176, 0.3)"
                                : "1px solid transparent",
                              "&:hover": {
                                bgcolor: isFiltered
                                  ? "rgba(156, 39, 176, 0.15)"
                                  : "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  backgroundColor: stat.color,
                                  borderRadius: 1,
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: isFiltered ? 600 : 400,
                                  color: isFiltered
                                    ? "secondary.main"
                                    : "inherit",
                                }}
                              >
                                {stat.type} {isFiltered && "✓"}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                color: isFiltered
                                  ? "secondary.main"
                                  : "inherit",
                              }}
                            >
                              {stat.count}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </>
  );
};
