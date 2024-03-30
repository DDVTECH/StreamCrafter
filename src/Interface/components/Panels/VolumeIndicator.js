/*



*/
import React from 'react';
import { useState, useEffect } from "react";
import "./style.css";

const VolumeIndicator = (props) => {
  const [thisVolume, setVolume] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!props.stateRef.current) {
        setVolume(0);
        return;
      }
      if (thisVolume != props.stateRef.current.volume) {
        setVolume(props.stateRef.current.volume);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [props.stateRef.current]);

  let width = 100 - Math.min(100, props.disabled ? 0 : thisVolume) + "%";

  return (
    <div
      className="column-container"
      style={{
        justifyContent: "space-between",
        alignContent: "center",
        display: "flex",
        height: "1em",
      }}
    >
      <div className="progress-bar-container">
        <div className="progress-bar-child progress"></div>
        <div
          className="progress-bar-child shrinker"
          style={{
            width: width,
          }}
        ></div>
      </div>
    </div>
  );
};

export default VolumeIndicator;
