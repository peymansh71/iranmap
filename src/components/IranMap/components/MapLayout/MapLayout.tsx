import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { NotificationState } from "../../types";

interface MapLayoutProps {
  loading: boolean;
  notification: NotificationState;
  onNotificationClose: () => void;
  children: React.ReactNode;
}

export const MapLayout: React.FC<MapLayoutProps> = ({
  loading,
  notification,
  onNotificationClose,
  children,
}) => {
  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100vw" }}>
      {children}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              در حال پردازش...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={onNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={onNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
