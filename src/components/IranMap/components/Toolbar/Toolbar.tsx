import React from "react";
import {
  Box,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  TableView as TableViewIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import { PERSIAN_LABELS } from "../../constants/index.ts";

interface ToolbarProps {
  onSettingsOpen: () => void;
  onEmployeeModalOpen: () => void;
  onLogout: () => void;
  exportMenuAnchor: HTMLElement | null;
  setExportMenuAnchor: (anchor: HTMLElement | null) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  allProjectsCount: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSettingsOpen,
  onEmployeeModalOpen,
  onLogout,
  exportMenuAnchor,
  setExportMenuAnchor,
  onExportCSV,
  onExportJSON,
  allProjectsCount,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        display: "flex",
        gap: 1,
        zIndex: 1000,
      }}
    >
      <Tooltip title={PERSIAN_LABELS.manageIndexes}>
        <IconButton
          onClick={onSettingsOpen}
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "gray", color: "white" },
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      {/* Employee Management */}
      <Tooltip title="مدیریت کارکنان">
        <IconButton
          onClick={onEmployeeModalOpen}
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "success.main", color: "white" },
          }}
        >
          <PeopleIcon />
        </IconButton>
      </Tooltip>

      {/* Export Menu */}
      <Tooltip title="دانلود داده‌ها">
        <IconButton
          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          disabled={allProjectsCount === 0}
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "primary.main", color: "white" },
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <MenuItem onClick={onExportCSV}>
          <ListItemIcon>
            <TableViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={onExportJSON}>
          <ListItemIcon>
            <GetAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>JSON</ListItemText>
        </MenuItem>
      </Menu>

      <Tooltip title={PERSIAN_LABELS.logout}>
        <IconButton
          onClick={onLogout}
          sx={{
            bgcolor: "error.main",
            color: "white",
            "&:hover": { bgcolor: "white", color: "error.main" },
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar;
