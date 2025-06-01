import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";

const ProvinceTable = ({ provinceInfo }) => {
  if (!provinceInfo) return null;

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>شاخص</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>مقدار</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {provinceInfo.fields.map((field, index) => (
              <TableRow key={index}>
                <TableCell>{field.label}</TableCell>
                <TableCell>{field.value?.toLocaleString("fa-IR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProvinceTable;
