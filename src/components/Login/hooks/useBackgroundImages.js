import { useState, useEffect } from "react";

export const BACKGROUNDS = [
  "/assets/1.jpg",
  "/assets/2.jpg",
  "/assets/3.jpg",
  "/assets/4.jpg",
  "/assets/5.jpg",
  "/assets/6.jpg",
];

export const BACKGROUND_CHANGE_INTERVAL = 50000;

export const useBackgroundImages = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
    }, BACKGROUND_CHANGE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    currentBg,
    backgrounds: BACKGROUNDS,
  };
};
