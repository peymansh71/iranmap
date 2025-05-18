import React from "react";
import { Modal, Box, Typography, IconButton, Divider } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ProvinceTable from "./components/ProvinceTable";
import ProvincePieChart from "./components/ProvincePieChart";
import ProvinceBarChart from "./components/ProvinceBarChart";

const ProvinceInfoModal = ({
  open,
  onClose,
  provinceInfo,
  tab,
  setTab,
  persianLabels,
}) => {
  const hasData = provinceInfo?.fields?.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="province-modal"
      aria-describedby="province-modal-description"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid lightblue",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box>
            <IconButton onClick={() => setTab(0)}>
              <TableChartIcon color={tab === 0 ? "primary" : "inherit"} />
            </IconButton>
            <IconButton onClick={() => setTab(1)}>
              <PieChartIcon color={tab === 1 ? "primary" : "inherit"} />
            </IconButton>
            <IconButton onClick={() => setTab(2)}>
              <BarChartIcon color={tab === 2 ? "primary" : "inherit"} />
            </IconButton>
          </Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {provinceInfo?.province?.name_fa || "استانی انتخاب نشده است"}
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            visibility={"hidden"}
          >
            {provinceInfo?.province?.name_fa || "استانی انتخاب نشده است"}
          </Typography>
        </Box>
        <Divider />
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!hasData ? (
            <Typography variant="h6" color="text.secondary" align="center">
              اطلاعاتی برای این استان ثبت نشده است
            </Typography>
          ) : (
            <>
              {tab === 0 && (
                <ProvinceTable
                  provinceInfo={provinceInfo}
                  persianLabels={persianLabels}
                />
              )}
              {tab === 1 && (
                <ProvincePieChart
                  provinceInfo={provinceInfo}
                  persianLabels={persianLabels}
                />
              )}
              {tab === 2 && (
                <ProvinceBarChart
                  provinceInfo={provinceInfo}
                  persianLabels={persianLabels}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ProvinceInfoModal;
