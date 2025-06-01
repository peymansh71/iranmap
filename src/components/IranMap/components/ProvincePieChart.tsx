import React from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography } from "@mui/material";

const ProvincePieChart = ({ provinceInfo }) => {
  if (!provinceInfo) return null;

  const pieData = provinceInfo.fields.map((field) => ({
    value: field.value,
    name: field.label,
  }));

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
      trigger: "item",
      formatter: "{b}: {c}",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      left: "center",
      textStyle: {
        fontFamily: "inherit",
        width: 100,
        overflow: "truncate",
      },
      itemGap: 24,
    },
    series: [
      {
        name: "اطلاعات پروژه",
        type: "pie",
        radius: "60%",
        center: ["50%", "55%"],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
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

export default ProvincePieChart;
