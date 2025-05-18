import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";

// Mock data for additional city information
const getCityInfo = (cityName) => {
  const mockData = {
    Tehran: {
      population: "8.7 million",
      area: "730 km²",
      founded: "1796",
      elevation: "1,200 m",
      attractions: ["Milad Tower", "Golestan Palace", "Azadi Tower"],
    },
    Mashhad: {
      population: "3.3 million",
      area: "351 km²",
      founded: "818",
      elevation: "995 m",
      attractions: ["Imam Reza Shrine", "Kooh Sangi", "Tomb of Nader Shah"],
    },
    Isfahan: {
      population: "2.2 million",
      area: "551 km²",
      founded: "Ancient",
      elevation: "1,574 m",
      attractions: ["Naqsh-e Jahan Square", "Si-o-se-pol", "Chehel Sotoun"],
    },
    Shiraz: {
      population: "1.9 million",
      area: "240 km²",
      founded: "Ancient",
      elevation: "1,486 m",
      attractions: ["Persepolis", "Nasir al-Mulk Mosque", "Eram Garden"],
    },
    Tabriz: {
      population: "1.7 million",
      area: "324 km²",
      founded: "Ancient",
      elevation: "1,351 m",
      attractions: ["Tabriz Historic Bazaar", "Blue Mosque", "El Goli"],
    },
  };
  return (
    mockData[cityName] || {
      population: "N/A",
      area: "N/A",
      founded: "N/A",
      elevation: "N/A",
      attractions: ["No data available"],
    }
  );
};

const CityModal = ({ city, onClose }) => {
  const cityInfo = getCityInfo(city.city);

  return (
    <Dialog open={Boolean(city)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h4" component="div">
          {city.city}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {city.province} Province
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Location
          </Typography>
          <Typography>
            <strong>Latitude:</strong> {city.lat}°N
          </Typography>
          <Typography>
            <strong>Longitude:</strong> {city.lng}°E
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            City Information
          </Typography>
          <Typography>
            <strong>Population:</strong> {cityInfo.population}
          </Typography>
          <Typography>
            <strong>Area:</strong> {cityInfo.area}
          </Typography>
          <Typography>
            <strong>Founded:</strong> {cityInfo.founded}
          </Typography>
          <Typography>
            <strong>Elevation:</strong> {cityInfo.elevation}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Major Attractions
          </Typography>
          {cityInfo.attractions.map((attraction, index) => (
            <Typography key={index}>• {attraction}</Typography>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CityModal;
