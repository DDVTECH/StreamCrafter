/*



*/
import React from 'react';
import { useState, useRef, useEffect } from "react";
import useWindowSize from "../../hooks/WithWindowSize";
import useClickOutside from "../../hooks/WithClickOutside";

const CenterModal = (props) => {
  const screenSize = useWindowSize();
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useClickOutside(elementRef, props.closeModals);

  useEffect(() => {
    if (elementRef.current) {
      setWidth(elementRef.current.scrollWidth);
      setHeight(elementRef.current.scrollHeight);
    }
  }, [elementRef.current]);

  let leftOffset = screenSize.width / 2 - width / 2;
  let topOffset = screenSize.height / 2 - height / 2;

  return (
    <div
      ref={elementRef}
      className="darkFg foregroundBorder"
      style={{
        position: "absolute",
        borderRadius: "5px",
        display: "inline-block",
        visibility: width || height ? "visible" : "hidden",
        left: leftOffset,
        top: topOffset,
        maxWidth: "90vw",
        zIndex: 99,
      }}
    >
      <h3 style={{ textAlign: "center", width: "100%" }}>{props.title}</h3>
      <hr
        className="foregroundBorderBot"
        style={{
          width: "100%",
        }}
      />
      {props.data}
    </div>
  );
};

export default CenterModal;
