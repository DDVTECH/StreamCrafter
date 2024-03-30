/*

Renders a context menu of sub-components at a given location

*/
import React from 'react';
import { useState, useRef, useEffect } from "react";
import useWindowSize from "../../hooks/WithWindowSize";
import useClickOutside from "../../hooks/WithClickOutside";
import "./style.css";

const ContextMenu = (props) => {
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

  let leftOffset = props.clickEvent.pageX;
  if (props.clickEvent.pageX + width > screenSize.width) {
    leftOffset = props.clickEvent.pageX - width - 5;
  }
  let topOffset = props.clickEvent.pageY;
  if (
    props.clickEvent.pageY > screenSize.height * 0.75
  ) {
    topOffset = props.clickEvent.pageY - height - 5;
  } else if (
    props.clickEvent.pageY + height > screenSize.height
  ) {
    topOffset = screenSize.height - height - 5;
  }

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

export default ContextMenu;
