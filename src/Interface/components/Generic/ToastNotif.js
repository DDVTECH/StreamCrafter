/*

Renders a context menu of sub-components at a given location

*/
import React from 'react';
import "./style.css";
import { useEffect, useState, useRef } from "react";

const ToastNotif = ({ message, event, setToast }) => {
  const [showToast, setShowToast] = useState(false);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (!countdownRef.current){
      setShowToast(true);
      countdownRef.current = true;
      setTimeout(() => {
        setShowToast(false);
      }, 500);
    }
  }, [message]);

  useEffect(() => {
    if (!showToast) {
      setTimeout(() => {
        countdownRef.current = false;
        setToast(null);
      }, 500);
    }
  }, [showToast]);

  return (
    (message && (
      <div
        className={`darkBg ${showToast ? "fadeIn" : "fadeOut"}`}
        style={{
          position: "absolute",
          borderRadius: "5px",
          display: "inline-block",
          left: event?.pageX || 0,
          top: event?.pageY || 0,
          zIndex: 99,
          paddingLeft: "1em",
          paddingRight: "1em",
        }}
      >
        <p style={{ textAlign: "center", width: "100%" }}>{message || ""}</p>
      </div>
    )) ||
    null
  );
};

export default ToastNotif;
