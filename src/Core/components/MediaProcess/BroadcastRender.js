/*

Renders a hidden canvas to be used for broadcasting. The active scene or asset gets drawn to it
Canvas is transferred to the web worker as an OffScreenCanvas

*/
import React from 'react';
import { useEffect, useRef, useState } from "react";

const BroadcastRender = (props) => {
  const broadcastVideo = useRef(); //< Ref to DOM element
  const [isOffScreenCanvas, setOffScreenCanvas] = useState(false); //< If transferred offscreen, the canvas is locked from certain actions

  // initialize:
  //  - canvas->MediaStream to broadcastCanvas->mediaStreamRef for broadcasting
  //  - canvas to broadcastCanvas->mediaDOMRef for previewing, animating
  useEffect(() => {
    if (!props.broadcastCanvas) {
      return;
    }
    if (!broadcastVideo.current) {
      return;
    }
    if (props.broadcastCanvas.mediaStreamRef.current) {
      return;
    }
    if (props.broadcastCanvas.mediaDOMRef.current) {
      return;
    }
    // Capture video for broadcasting purposes
    props.broadcastCanvas.mediaStreamRef.current =
      broadcastVideo.current.captureStream(30);
    // Go go gadget autoplay
    var onVideoLoaded = () => {
      broadcastVideo.current.play();
    };
    broadcastVideo.current.autoplay = true;
    broadcastVideo.current.addEventListener("loadeddata", onVideoLoaded);
    props.broadcastCanvas.mediaDOMRef.current = broadcastVideo.current;
    console.log("created hidden broadcast canvas");
  }, [
    props.broadcastCanvas?.mediaStreamRef,
    props.broadcastCanvas?.id,
    broadcastVideo.current,
  ]);

  // Transfer canvas to worker
  useEffect(() => {
    if (!props.broadcastCanvas) {
      return;
    }
    if (isOffScreenCanvas) {
      return;
    }
    console.log(
      "turning broadcast canvas into offscreen canvas. Passing to compositor..."
    );
    try {
      const offscreen = broadcastVideo.current.transferControlToOffscreen();
      props.workerCompositor.postMessage(
        {
          canvas: offscreen,
          evt: "onBroadcastCanvas",
        },
        [offscreen]
      );
      setOffScreenCanvas(true);
    } catch (e) {
      console.log(e);
      props.setErr(true);
    }
  }, [
    props.broadcastCanvas,
    broadcastVideo.current,
    props.currentStream,
    props.currentStream?.layers,
  ]);

  const height = props.currentStream?.properties?.height || props.broadcastCanvas?.properties?.defaultHeight;
  const width = props.currentStream?.properties?.width || props.broadcastCanvas?.properties?.defaultWidth;

  return (
    <canvas
      hidden
      control="false"
      playsInline
      autoPlay={true}
      muted="muted"
      ref={broadcastVideo}
      height={height}
      width={width}
    ></canvas>
  );
};

export default BroadcastRender;
