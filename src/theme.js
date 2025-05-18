import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: [
      "Vazirmatn",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  direction: "rtl",
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "Vazirmatn, sans-serif",
        },
      },
    },
  },
});

export default theme;
