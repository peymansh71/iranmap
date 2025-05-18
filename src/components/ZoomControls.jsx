import React from "react";
import { Button, ButtonGroup } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ZoomControls = ({ onZoomIn, onZoomOut }) => {
  return (
    <ButtonGroup
      orientation="vertical"
      variant="contained"
      sx={{
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Button onClick={onZoomIn}>
        <AddIcon />
      </Button>
      <Button onClick={onZoomOut}>
        <RemoveIcon />
      </Button>
    </ButtonGroup>
  );
};

export default ZoomControls;
