/*

Renders a hidden canvas to be used for broadcasting. The active scene or asset gets drawn to it
If using web workers, said canvas is transferred to the web worker as an OffScreenCanvas

*/
import React from 'react';
import { useEffect, useRef, useCallback, useState } from "react";

const BroadcastRender = (props) => {
  const broadcastVideo = useRef(); //< Ref to DOM element
  const broadcastContext = useRef(); //< Store context and reuse in the animation loop
  const broadcastAnimation = useRef(); //< Start/stop the animation loop
  const [isOffScreenCanvas, setOffScreenCanvas] = useState(false); //< If transferred offscreen, the canvas is locked from certain actions

  // Draws the current active stream
  const animateBroadcast = useCallback(
    (time) => {
      let width = props.broadcastCanvas.properties.width;
      let height = props.broadcastCanvas.properties.height;
      let color = props.currentStream?.properties?.backgroundColor || "#3b4252";

      // Reset opacity
      broadcastContext.current.globalAlpha = 1;

      // Clear canvas
      broadcastContext.current.clearRect(0, 0, width, height);
      broadcastContext.current.fillStyle = color;
      broadcastContext.current.fillRect(0, 0, width, height);

      // Update video
      if (props.currentStream?.mediaDOMRef?.current) {
        broadcastContext.current.drawImage(
          props.currentStream.mediaDOMRef.current,
          0,
          0,
          width,
          height
        );
      }

      if (broadcastAnimation.current !== null) {
        broadcastAnimation.current = requestAnimationFrame(animateBroadcast);
      }
    },
    [
      props.currentStream?.mediaDOMRef?.current,
      props.currentStream,
      props.broadcastCanvas.properties,
    ]
  );

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

  // Restart animation loop or transfer canvas to worker
  useEffect(() => {
    if (!props.broadcastCanvas) {
      return;
    }
    if (!broadcastVideo.current) {
      return;
    }
    if (broadcastAnimation.current !== null) {
      cancelAnimationFrame(broadcastAnimation.current);
    }
    if (props.useWebWorker) {
      if (isOffScreenCanvas) {
        return;
      }
      if (broadcastContext.current) {
        broadcastContext.current.reset();
        broadcastContext.current = null;
      }
      console.log(
        "turning broadcast canvas into offscreen one. Passing to compositor..."
      );
      const offscreen = broadcastVideo.current.transferControlToOffscreen();
      props.workerCompositor.postMessage(
        {
          canvas: offscreen,
          evt: "onBroadcastCanvas",
          height: props.broadcastCanvas.properties.height,
          width: props.broadcastCanvas.properties.width,
        },
        [offscreen]
      );
      setOffScreenCanvas(true);
    } else {
      console.log("animating hidden broadcast canvas", props.currentStream);
      if (!broadcastContext.current) {
        broadcastContext.current = broadcastVideo.current.getContext("2d");
      }
      broadcastAnimation.current = requestAnimationFrame(animateBroadcast);
    }
  }, [
    props.broadcastCanvas,
    broadcastVideo.current,
    props.currentStream,
    props.currentStream?.layers,
  ]);

  return (
    <canvas
      hidden
      control="false"
      playsInline
      autoPlay={true}
      muted="muted"
      ref={broadcastVideo}
      height={props.broadcastCanvas.properties.height}
      width={props.broadcastCanvas.properties.width}
    ></canvas>
  );
};

export default BroadcastRender;
