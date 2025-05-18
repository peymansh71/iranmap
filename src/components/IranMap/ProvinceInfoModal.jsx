import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ReactECharts from "echarts-for-react";

const ProvinceInfoModal = ({
  open,
  onClose,
  provinceInfo,
  tab,
  setTab,
  persianLabels,
  pieOption,
  barOption,
}) => (
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
          {provinceInfo?.name || "استانی انتخاب نشده است"}
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          visibility={"hidden"}
        >
          {provinceInfo?.name || "استانی انتخاب نشده است"}
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
        {tab === 0 && provinceInfo && (
          <TableContainer component={Paper} sx={{ maxWidth: 500 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                    شاخص
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", textAlign: "right" }}
                  >
                    مقدار
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ textAlign: "right" }}>
                    {persianLabels.population}
                  </TableCell>
                  <TableCell align="right" sx={{ textAlign: "right" }}>
                    {provinceInfo.population?.toLocaleString("fa-IR")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ textAlign: "right" }}>
                    {persianLabels.area}
                  </TableCell>
                  <TableCell align="right" sx={{ textAlign: "right" }}>
                    {provinceInfo.area_km2?.toLocaleString("fa-IR")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ textAlign: "right" }}>
                    {persianLabels.density}
                  </TableCell>
                  <TableCell align="right" sx={{ textAlign: "right" }}>
                    {provinceInfo.population_density?.toLocaleString("fa-IR")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ textAlign: "right" }}>
                    {persianLabels.gdp}
                  </TableCell>
                  <TableCell align="right" sx={{ textAlign: "right" }}>
                    {provinceInfo.gdp_share_percent?.toLocaleString("fa-IR")}٪
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 1 && provinceInfo && (
          <ReactECharts
            option={pieOption}
            style={{ height: "100%", width: 500 }}
          />
        )}
        {tab === 2 && provinceInfo && (
          <ReactECharts
            option={barOption}
            style={{ height: "100%", width: 500 }}
          />
        )}
      </Box>
    </Box>
  </Modal>
);

export default ProvinceInfoModal;
