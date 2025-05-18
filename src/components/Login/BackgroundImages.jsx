import React from "react";
import { styles } from "./styles";

const BackgroundImages = ({ backgrounds, currentBg }) => {
  return (
    <>
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          style={{
            ...styles.backgroundImage(currentBg === index),
            backgroundImage: `url(${bg})`,
          }}
        />
      ))}
      <div style={styles.overlay} />
    </>
  );
};

export default BackgroundImages;
