import { useEffect, useRef, useCallback } from "react";
import React from 'react';
/*

Takes a scene and draws sources to the canvas according to the config
Disabled when using web workers

*/

const CompositeRender = ({
  mediaStream,
  mediaStreams,
  width,
  height,
  useWebWorker,
  isCurrentStream
}) => {
  const requestRef = useRef(); //< ref for animation loop
  const localVideo = useRef(); //< local hidden canvas
  const patternCanvas = useRef(); //< ref diagonal lines pattern
  const lastTime = useRef(); //< ref

  useEffect(() => {
    if (!patternCanvas.current) {
      return;
    }
    console.log("Drawing pattern to hidden canvas");
    const bgCtx = patternCanvas.current.getContext("2d");
    bgCtx.globalAlpha = 0.3;
    var color1 = "#bf616a",
      color2 = "#d8dee9";
    var numberOfStripes = 10;
    for (var i = 0; i < numberOfStripes * 2; i++) {
      var thickness = 400 / numberOfStripes;
      bgCtx.beginPath();
      bgCtx.strokeStyle = i % 2 ? color1 : color2;
      bgCtx.lineWidth = thickness;
      bgCtx.lineCap = "square";

      bgCtx.moveTo(i * thickness + thickness / 2 - 400, 0);
      bgCtx.lineTo(0 + i * thickness + thickness / 2, 400);
      bgCtx.stroke();
    }
  }, [patternCanvas.current]);

  useEffect(() => {
    if (lastTime.current) {
      return;
    }
    lastTime.current = Date.now();
  }, [lastTime.current]);

  // Pads strings to a certain length using '0'. Handy for drawing time-related stuff
  function zPad(v, l) {
    while ((v + "").length < l) {
      v = "0" + v;
    }
    return v;
  }

  // Draws all layers and other stuff to the canvas
  const animate = useCallback(
    (time) => {
      if (!localVideo.current) {
        console.log(
          "Cancelling animation loop for scene, as the canvas element disappeared"
        );
        return;
      }
      // If not enough time has passed, wait
      let now = Date.now();
      let delta = now - lastTime.current;
      // Restrict animation loop to 25 FPS, down to 10 FPS if using web workers
      var fps = 30;
      if (useWebWorker || !isCurrentStream) {
        fps = 10;
      }
      var interval = 1000 / fps;
      if (delta < interval) {
        if (requestRef.current !== null) {
          requestRef.current = requestAnimationFrame(animate);
        }
        return;
      }
      lastTime.current = now - (delta % interval);

      const canvasContext = localVideo.current.getContext("2d");
      // Resize the canvas if the dimensions of the scene change
      if (localVideo.current.height != height) {
        localVideo.current.height = height;
      }
      if (localVideo.current.width != width) {
        localVideo.current.width = width;
      }

      // Reset opacity
      canvasContext.globalAlpha = 1;

      // Clear canvas
      canvasContext.fillStyle =
        mediaStream.properties?.backgroundColor || "#AAAAFF";
      canvasContext.fillRect(0, 0, width, height);

      // Crop, position then draw all layers of the scene
      for (const layerInfo of mediaStream.layers) {
        // lookup source track
        let found = false;
        for (const srcStream of mediaStreams) {
          if (!srcStream.hasVideo){
            continue;
          }
          // Wait for rendered video to appear
          if (!srcStream.mediaDOMRef?.current || null) {
            continue;
          }
          if (srcStream.id != layerInfo.srcId) {
            continue;
          }
          found = true;
          canvasContext.globalAlpha = parseFloat(
            layerInfo.properties.opacity / 100
          );
          let pos = {
            x: layerInfo.hiddenProperties.cropStartX,
            y: layerInfo.hiddenProperties.cropStartY,
            width: Math.min(
              layerInfo.hiddenProperties.cropWidth,
              srcStream.mediaDOMRef.current.videoWidth -
                layerInfo.hiddenProperties.cropStartX
            ),
            height: Math.min(
              layerInfo.hiddenProperties.cropHeight,
              srcStream.mediaDOMRef.current.videoHeight -
                layerInfo.hiddenProperties.cropStartY
            ),
          };
          if (layerInfo.properties.autoFit) {
            const requiredRatio =
              layerInfo.properties.width / layerInfo.properties.height;
            const currentRatio = pos.width / pos.height;
            if (requiredRatio > currentRatio) {
              const shavings = pos.height - pos.width / requiredRatio;
              pos.y += shavings / 2;
              pos.height -= shavings;
            } else if (requiredRatio < currentRatio) {
              const shavings = pos.width - pos.height * requiredRatio;
              pos.x += shavings / 2;
              pos.width -= shavings;
            }
          }
          canvasContext.drawImage(
            srcStream.mediaDOMRef.current,
            pos.x,
            pos.y,
            pos.width,
            pos.height,
            layerInfo.properties.x,
            layerInfo.properties.y,
            layerInfo.properties.width,
            layerInfo.properties.height
          );
          break;
        }
        if (!found) {
          // Apply pattern
          if (patternCanvas.current) {
            canvasContext.fillStyle = canvasContext.createPattern(
              patternCanvas.current,
              "repeat"
            );
            canvasContext.fillRect(
              layerInfo.properties.x,
              layerInfo.properties.y,
              layerInfo.properties.width,
              layerInfo.properties.height
            );
          }
          // Question mark in the center
          canvasContext.textBaseline = "middle";
          canvasContext.textAlign = "center";
          canvasContext.fillStyle = "rgba(229, 233, 240, 0.7)";
          const pixelSize = layerInfo.properties.width / 4;
          canvasContext.font = "bold " + pixelSize + "px sans-serif";
          const text = "?";
          canvasContext.fillText(
            text,
            layerInfo.properties.x + layerInfo.properties.width / 2,
            layerInfo.properties.y + layerInfo.properties.height / 2
          );
          // Shaded background
          canvasContext.fillStyle = "rgba(229, 233, 240, 0.2)";
          canvasContext.fillRect(
            layerInfo.properties.x,
            layerInfo.properties.y,
            layerInfo.properties.width,
            layerInfo.properties.height
          );
          // Outline on top
          canvasContext.strokeStyle = "#d08770";
          canvasContext.lineWidth = 5;
          canvasContext.beginPath();
          canvasContext.strokeRect(
            layerInfo.properties.x + 3 / 2,
            layerInfo.properties.y + 3 / 2,
            layerInfo.properties.width - 3,
            layerInfo.properties.height - 3
          );
          canvasContext.closePath();
          continue;
        }
      }
      canvasContext.globalAlpha = 1;

      // Draw date-time object to the center of the canvas
      if (mediaStream.properties?.drawClock) {
        canvasContext.fillStyle =
          mediaStream.properties?.gridColor || "#000000";
        canvasContext.textBaseline = "middle";
        canvasContext.textAlign = "center";
        canvasContext.font = "bold 32px sans-serif";

        var d = new Date();
        var dt =
          d.getFullYear() +
          "/" +
          zPad(d.getMonth() + 1, 2) +
          "/" +
          zPad(d.getDate(), 2) +
          " " +
          zPad(d.getHours(), 2) +
          ":" +
          zPad(d.getMinutes(), 2) +
          ":" +
          zPad(d.getSeconds(), 2);
        canvasContext.fillText(dt, width / 2, height / 2);
      }

      if (requestRef.current !== null) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    [useWebWorker, mediaStream.layers, mediaStreams, isCurrentStream]
  );

  // (re)start animation loop on changes to ensure it reads current info
  useEffect(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mediaStreams?.length, mediaStream?.layers?.length, useWebWorker, isCurrentStream]);

  // initialize:
  //  - canvas->MediaStream to mediaStream->mediaStreamRef for broadcasting
  //  - canvas to mediaStream->mediaDOMRef for previewing, animating
  useEffect(() => {
    if (mediaStream.mediaStreamRef.current) {
      return;
    }
    mediaStream.mediaStreamRef.current = localVideo.current.captureStream(30);
    // Go go gadget autoplay
    var onVideoLoaded = () => {
      localVideo.current.play();
    };
    localVideo.current.autoplay = true;
    localVideo.current.addEventListener("loadeddata", onVideoLoaded);
    mediaStream.mediaDOMRef.current = localVideo.current;
    console.log(
      "rendering hidden canvas for compositor, outputting tracks:",
      mediaStream.mediaStreamRef.current.getTracks()
    );
  }, []);

  return (
    <div className="flex-parent">
      <canvas
        control="false"
        playsInline
        autoPlay={true}
        muted="muted"
        ref={localVideo}
        height={height}
        width={width}
        hidden
      />
      <canvas
        hidden
        control="false"
        playsInline
        autoPlay={true}
        muted="muted"
        ref={patternCanvas}
        height={400}
        width={400}
      ></canvas>
    </div>
  );
};

export default CompositeRender;
