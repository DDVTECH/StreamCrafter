/*



*/
import React from "react";
import { useEffect, useRef, useCallback } from "react";
const outlineWidth = 5;
const padding = 50;

const LayerClipping = (props) => {
  const requestRef = useRef(); //< ref for animation loop
  const localVideo = useRef(); //< local preview canvas
  const dragStart = useRef();
  const dragAction = useRef();

  const animate = useCallback((time) => {
    const canvasContext = localVideo.current.getContext("2d");

    // Reset opacity
    canvasContext.globalAlpha = 1;

    // Clear canvas
    canvasContext.fillStyle = "#3b4252";
    canvasContext.fillRect(
      0,
      0,
      props.srcStream.mediaDOMRef.current.videoWidth + padding + padding,
      props.srcStream.mediaDOMRef.current.videoHeight + padding + padding
    );

    // Draw layer source stream
    canvasContext.drawImage(
      props.srcStream.mediaDOMRef.current,
      padding,
      padding,
      props.srcStream.mediaDOMRef.current.videoWidth,
      props.srcStream.mediaDOMRef.current.videoHeight
    );

    // Draw clipping rectangle
    if (dragStart.current && dragAction.current) {
      let xStart =
        Math.min(dragStart.current.x, dragAction.current.x) + padding;
      let xEnd = Math.max(dragStart.current.x, dragAction.current.x) + padding;
      let yStart =
        Math.min(dragStart.current.y, dragAction.current.y) + padding;
      let yEnd = Math.max(dragStart.current.y, dragAction.current.y) + padding;

      canvasContext.strokeStyle =
        props.currentStream?.properties?.gridColor || "#AAAAFF";
      canvasContext.globalAlpha = 0.8;
      canvasContext.lineWidth = outlineWidth;
      canvasContext.beginPath();
      canvasContext.strokeRect(
        xStart + outlineWidth / 2,
        yStart + outlineWidth / 2,
        xEnd - xStart - outlineWidth,
        yEnd - yStart - outlineWidth
      );
      canvasContext.closePath();
    }

    // Draw hint text
    canvasContext.fillStyle = "#e5e9f0";
    canvasContext.globalAlpha = 1.0;
    canvasContext.font = "bold " + padding / 2 + "px sans-serif";
    canvasContext.textBaseline = "middle";
    canvasContext.textAlign = "center";
    canvasContext.fillText(
      "Drag a rectangle to crop the image",
      (props.srcStream.mediaDOMRef.current.videoWidth + padding + padding) / 2,
      padding / 2
    );

    if (requestRef.current !== null) {
      requestRef.current = requestAnimationFrame(animate);
    }
  });

  const setNewProperties = (xStart, yStart, width, height) => {
    let newObj = props.currentStream;
    let newLayers = props.currentStream.layers;

    if (!width || !height) {
      return;
    }

    for (var idx = 0; idx < newLayers.length; idx++) {
      if (props.selectedLayer.id == newLayers[idx].id) {
        if (
          !xStart > newLayers[idx].hiddenProperties.originalWidth ||
          !yStart > newLayers[idx].hiddenProperties.originalHeight
        ) {
          return;
        }
        newLayers[idx].hiddenProperties.cropStartX = xStart;
        newLayers[idx].hiddenProperties.cropStartY = yStart;
        newLayers[idx].hiddenProperties.cropWidth = width;
        newLayers[idx].hiddenProperties.cropHeight = height;
        break;
      }
    }
    newObj.layers = newLayers;

    props.mutateMediaStream(newObj);
    props.closeModals();
  };

  // Mouse events
  const normalizeMouse = (x, y) => {
    const currentCoord = { x: x, y: y };
    const rect = localVideo.current.getBoundingClientRect();
    const xScale =
      (props.srcStream.mediaDOMRef.current.videoWidth + padding + padding) /
      rect.width;
    const yScale =
      (props.srcStream.mediaDOMRef.current.videoHeight + padding + padding) /
      rect.height;

    // Subtract canvas offset
    currentCoord.x -= rect.x;
    currentCoord.y -= rect.y;

    // Get real coords
    currentCoord.x *= xScale;
    currentCoord.y *= yScale;

    // Remove padding
    currentCoord.x -= padding;
    currentCoord.y -= padding;

    // Clip to canvas without padding
    if (currentCoord.x < 0) {
      currentCoord.x = 0;
    }
    if (currentCoord.x >= props.srcStream.mediaDOMRef.current.videoWidth) {
      currentCoord.x = props.srcStream.mediaDOMRef.current.videoWidth;
    }
    if (currentCoord.y < 0) {
      currentCoord.y = 0;
    }
    if (currentCoord.y >= props.srcStream.mediaDOMRef.current.videoHeight) {
      currentCoord.y = props.srcStream.mediaDOMRef.current.videoHeight;
    }

    return { x: currentCoord.x, y: currentCoord.y };
  };

  const handleMouseDown = useCallback((e) => {
    const coords = normalizeMouse(
      e.clientX || (e.touches?.length && e.touches[0].clientX),
      e.clientY || (e.touches?.length && e.touches[0].clientY)
    );
    dragStart.current = coords;
    console.log("Starting clipping");
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (e.button == 2) {
      props.closeModals();
    }
    if (!dragStart.current || !dragAction.current) {
      return;
    }
    const xStart = Math.min(dragStart.current.x, dragAction.current.x);
    const xEnd = Math.max(dragStart.current.x, dragAction.current.x);
    const yStart = Math.min(dragStart.current.y, dragAction.current.y);
    const yEnd = Math.max(dragStart.current.y, dragAction.current.y);
    const width = xEnd - xStart;
    const height = yEnd - yStart;

    dragAction.current = null;
    dragStart.current = null;
    console.log("Finished clipping");
    setNewProperties(xStart, yStart, width, height);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const coords = normalizeMouse(
      e.clientX || (e.touches?.length && e.touches[0].clientX),
      e.clientY || (e.touches?.length && e.touches[0].clientY)
    );
    dragAction.current = coords;
  }, []);

  const touchEnd = (e) => {
    e.preventDefault();
    handleMouseUp(e);
  };
  const touchMove = (e) => {
    e.preventDefault();
    handleMouseMove(e);
  };
  const touchStart = (e) => {
    e.preventDefault();
    handleMouseDown(e);
  };

  useEffect(() => {
    if (!localVideo.current) {
      return;
    }
    // Go go gadget autoplay
    var onVideoLoaded = () => {
      localVideo.current.play();
    };
    localVideo.current.autoplay = true;
    localVideo.current.addEventListener("loadeddata", onVideoLoaded);
    console.log("rendering clipping preview canvas");
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    localVideo.current.addEventListener("mousedown", handleMouseDown);
    localVideo.current.addEventListener("mouseup", handleMouseUp);
    localVideo.current.addEventListener("mousemove", handleMouseMove);
    localVideo.current.addEventListener("touchstart", touchStart);
    localVideo.current.addEventListener("touchmove", touchMove);
    localVideo.current.addEventListener("touchend", touchEnd);
    localVideo.current.addEventListener("touchcancel", handleMouseUp);
    localVideo.current.addEventListener("touchleave", handleMouseUp);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (!localVideo.current) {
        return;
      }
      localVideo.current.removeEventListener("mousedown", handleMouseDown);
      localVideo.current.removeEventListener("mouseup", handleMouseUp);
      localVideo.current.removeEventListener("mousemove", handleMouseMove);
      localVideo.current.removeEventListener("touchstart", touchStart);
      localVideo.current.removeEventListener("touchmove", touchMove);
      localVideo.current.removeEventListener("touchend", touchEnd);
      localVideo.current.removeEventListener("touchcancel", handleMouseUp);
      localVideo.current.removeEventListener("touchleave", handleMouseUp);
    };
  }, [localVideo.current]);

  const catchDefault = (event) => {
    event.preventDefault(); //< no context menu
  };

  if (!props.selectedLayer || !props.srcStream) {
    return;
  }

  return (
    <div
      className="flex-parent darkFg"
      style={{
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        position: "absolute",
        display: "inline-block",
        width: "100%",
        maxWidth: "100vw",
        height: "100%",
        maxHeight: "100vh",
        zIndex: 99,
      }}
    >
      <canvas
        control="false"
        playsInline
        autoPlay={true}
        muted="muted"
        ref={localVideo}
        height={
          props.srcStream.mediaDOMRef.current.videoHeight + padding + padding
        }
        width={
          props.srcStream.mediaDOMRef.current.videoWidth + padding + padding
        }
        onClick={catchDefault}
        onContextMenu={catchDefault}
        style={{
          width: "100%",
          maxHeight: "100vh",
          maxWidth: "100vw",
          cursor: "crosshair",
        }}
      />
    </div>
  );
};

export default LayerClipping;
