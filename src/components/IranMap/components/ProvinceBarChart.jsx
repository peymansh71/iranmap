import React from "react";
import ReactECharts from "echarts-for-react";

const ProvinceBarChart = ({ provinceInfo }) => {
  if (!provinceInfo) return null;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: provinceInfo.fields.map((field) => field.label),
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: provinceInfo.fields.map((field) => field.value),
        type: "bar",
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: "100%", width: 500 }} />
  );
};

export default ProvinceBarChart;
