import React from "react";
import ReactECharts from "echarts-for-react";

const ProvincePieChart = ({ provinceInfo }) => {
  if (!provinceInfo) return null;

  const pieData = provinceInfo.fields.map((field) => ({
    value: field.value,
    name: field.label,
  }));

  const option = {
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
        name: "اطلاعات استان",
        type: "pie",
        radius: "60%",
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
    <ReactECharts option={option} style={{ height: "100%", width: 500 }} />
  );
};

export default ProvincePieChart;
