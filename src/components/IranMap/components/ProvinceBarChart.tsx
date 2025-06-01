import React from "react";
import ReactECharts from "echarts-for-react";
import { Box } from "@mui/material";

const ProvinceBarChart = ({ provinceInfo }) => {
  if (!provinceInfo) return null;

  const option = {
    title: {
      text: provinceInfo.projectName
        ? `پروژه: ${provinceInfo.projectName}`
        : "",
      left: "center",
      top: 20,
      textStyle: {
        fontFamily: "inherit",
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "10%",
      right: "4%",
      bottom: "15%",
      top: "20%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: provinceInfo.fields.map((field) => field.label),
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontFamily: "inherit",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontFamily: "inherit",
      },
    },
    series: [
      {
        name: "مقدار",
        data: provinceInfo.fields.map((field) => field.value),
        type: "bar",
        itemStyle: {
          color: "#1976d2",
        },
      },
    ],
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </Box>
  );
};

export default ProvinceBarChart;
