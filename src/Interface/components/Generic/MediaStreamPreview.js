/*

Renders a Media Stream visible and as big as possible

*/
import React from 'react';
import { useEffect, useRef } from "react";

/*
props.streams
*/
const MediaStreamPreview = (props) => {
  const localVideo = useRef();
  const thisStyle = props.styleOverride || {
    height: "100%",
    width: "100%",
    maxHeight: "100vh",
    maxWidth: "100vw",
  };

  useEffect(() => {
    if (props.stream) {
      localVideo.current.srcObject = props.stream;
      localVideo.current.volume = 0;
      localVideo.current.muted = true;
      localVideo.current.play();
    } else {
      localVideo.current.pause();
      localVideo.current.srcObject = null;
    }
  }, [props.stream]);

  return (
    <video
      control="false"
      playsInline
      autoPlay={true}
      muted="muted"
      ref={localVideo}
      style={thisStyle}
      className={props.roundedBottoms ? "roundedBottoms" : ""}
    ></video>
  );
};

export default MediaStreamPreview;
