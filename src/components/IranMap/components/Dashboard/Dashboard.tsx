import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HotelIcon from "@mui/icons-material/Hotel";
import ConstructionIcon from "@mui/icons-material/Construction";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleIcon from "@mui/icons-material/People";
import { AdvancedStats } from "../../types";

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
              maxHeight: "80vh",
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
                p: 2.5,
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                آمار کلی پروژه‌ها و اقامتگاه‌ها
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ maxHeight: "60vh", overflow: "auto", p: 2.5 }}>
              {/* Filter Status */}
              {(selectedTypes.length > 0 || !showEmployees) && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(33, 150, 243, 0.08)",
                    borderRadius: 2,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
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
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      فیلترهای فعال (
                      {selectedTypes.length + (!showEmployees ? 1 : 0)})
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                      onClick={onClearAllFilters}
                    >
                      پاک کردن همه
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {/* Filter Tags */}
                    {selectedTypes.map((typeKey) => {
                      const [category, type] = typeKey.split("-");
                      const isHotel = category === "hotel";
                      return (
                        <Box
                          key={typeKey}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: isHotel
                              ? "secondary.main"
                              : "primary.main",
                            color: "white",
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const [, actualType] = typeKey.split("-");
                            onTypeFilter(
                              actualType,
                              category as "project" | "hotel"
                            );
                          }}
                        >
                          {isHotel ? (
                            <HotelIcon fontSize="inherit" />
                          ) : (
                            <ConstructionIcon fontSize="inherit" />
                          )}
                          {type}
                          <span style={{ marginLeft: "4px" }}>✕</span>
                        </Box>
                      );
                    })}

                    {!showEmployees && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "success.main",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                        onClick={() => onToggleEmployeeVisibility()}
                      >
                        <PeopleIcon fontSize="inherit" />
                        کارکنان مخفی
                        <span style={{ marginLeft: "4px" }}>✕</span>
                      </Box>
                    )}
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    نمایش {totalVisible} از {totalItems} پروژه/اقامتگاه
                    {!showEmployees && " • کارکنان مخفی"}
                  </Typography>
                </Box>
              )}

              {/* Project Status */}
              {stats.projects > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    وضعیت پروژه‌ها
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        {stats.activeProjects}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CheckCircleIcon
                            fontSize="inherit"
                            sx={{ color: "success.main" }}
                          />
                          فعال
                        </Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(244, 67, 54, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "error.main", fontWeight: 600 }}
                      >
                        {stats.inactiveProjects}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CancelIcon
                            fontSize="inherit"
                            sx={{ color: "error.main" }}
                          />
                          غیرفعال
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Hotel Status */}
              {stats.hotels > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    وضعیت اقامتگاه‌ها
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        {stats.activeHotels}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CheckCircleIcon
                            fontSize="inherit"
                            sx={{ color: "success.main" }}
                          />
                          فعال
                        </Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(244, 67, 54, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "error.main", fontWeight: 600 }}
                      >
                        {stats.inactiveHotels}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CancelIcon
                            fontSize="inherit"
                            sx={{ color: "error.main" }}
                          />
                          غیرفعال
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Employee Statistics */}
              {stats.employees > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      آمار کارکنان
                    </Typography>
                    {!showEmployees && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "success.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => onToggleEmployeeVisibility()}
                      >
                        نمایش کارکنان
                      </Typography>
                    )}
                  </Box>
                  <Box
                    onClick={onToggleEmployeeVisibility}
                    sx={{
                      display: "flex",
                      gap: 1,
                      cursor: "pointer",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: showEmployees
                        ? "rgba(76, 175, 80, 0.1)"
                        : "transparent",
                      border: showEmployees
                        ? "1px solid rgba(76, 175, 80, 0.3)"
                        : "1px solid transparent",
                      "&:hover": {
                        bgcolor: showEmployees
                          ? "rgba(76, 175, 80, 0.15)"
                          : "rgba(0, 0, 0, 0.04)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                        opacity: showEmployees ? 1 : 0.6,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "success.main",
                          fontWeight: showEmployees ? 600 : 400,
                        }}
                      >
                        {stats.employees} {showEmployees && "✓"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <PeopleIcon
                            fontSize="inherit"
                            sx={{ color: "success.main" }}
                          />
                          کل کارکنان
                        </Box>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                        borderRadius: 2,
                        textAlign: "center",
                        opacity: showEmployees ? 1 : 0.6,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "primary.main",
                          fontWeight: showEmployees ? 600 : 400,
                        }}
                      >
                        {stats.employeeProvinces}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <DashboardIcon
                            fontSize="inherit"
                            sx={{ color: "primary.main" }}
                          />
                          استان فعال
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Project Types Distribution */}
              {stats.projectTypeStats.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      توزیع انواع پروژه
                    </Typography>
                    {selectedTypes.some((type) =>
                      type.startsWith("project-")
                    ) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          const projectTypes = selectedTypes.filter((type) =>
                            type.startsWith("project-")
                          );
                          projectTypes.forEach((typeKey) => {
                            const [, type] = typeKey.split("-");
                            onTypeFilter(type, "project");
                          });
                        }}
                      >
                        پاک کردن فیلتر
                      </Typography>
                    )}
                  </Box>
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
                          mb: 1,
                          p: 1,
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
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: stat.color,
                              borderRadius: "50%",
                              mr: 1,
                              opacity: isFiltered ? 1 : 0.7,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: isFiltered ? 600 : 400,
                              color: isFiltered ? "primary.main" : "inherit",
                            }}
                          >
                            {stat.type} {isFiltered && "✓"}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isFiltered ? "primary.main" : "inherit",
                          }}
                        >
                          {stat.count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Hotel Types Distribution */}
              {stats.hotelTypeStats.length > 0 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      توزیع انواع اقامتگاه
                    </Typography>
                    {selectedTypes.some((type) =>
                      type.startsWith("hotel-")
                    ) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "secondary.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          const hotelTypes = selectedTypes.filter((type) =>
                            type.startsWith("hotel-")
                          );
                          hotelTypes.forEach((typeKey) => {
                            const [, type] = typeKey.split("-");
                            onTypeFilter(type, "hotel");
                          });
                        }}
                      >
                        پاک کردن فیلتر
                      </Typography>
                    )}
                  </Box>
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
                          mb: 1,
                          p: 1,
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
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: stat.color,
                              borderRadius: 1,
                              mr: 1,
                              opacity: isFiltered ? 1 : 0.7,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: isFiltered ? 600 : 400,
                              color: isFiltered ? "secondary.main" : "inherit",
                            }}
                          >
                            {stat.type} {isFiltered && "✓"}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 400,
                              color: isFiltered ? "secondary.main" : "inherit",
                            }}
                          >
                            {stat.count}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </>
  );
};
