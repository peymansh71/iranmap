import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const ProvinceTable = ({ provinceInfo }) => {
  if (!provinceInfo) return null;

  return (
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
          {provinceInfo.fields.map((field, index) => (
            <TableRow key={index}>
              <TableCell sx={{ textAlign: "right" }}>{field.label}</TableCell>
              <TableCell align="right" sx={{ textAlign: "right" }}>
                {field.value?.toLocaleString("fa-IR")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProvinceTable;
