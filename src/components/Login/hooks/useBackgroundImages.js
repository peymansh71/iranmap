import { useState, useEffect } from "react";

export const BACKGROUNDS = [
  "/assets/1.webp",
  "/assets/2.webp",
  "/assets/3.webp",
  "/assets/4.webp",
  "/assets/5.webp",
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
