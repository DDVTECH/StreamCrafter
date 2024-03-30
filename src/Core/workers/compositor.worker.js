/*

Compositor running in a service worker. Experimental and still under construction

*/
console.log("RESTARTING SERVICE WORKER");
// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  let broadcastCanvas = null; //< OffscreenCanvas to draw to
  let broadcastWidth = null;
  let broadcastHeight = null;
  let broadcastCanvasContext = null;
  let broadcastAnimationRef = null;
  let lastFrames = []; //< Buffer for VideoFrame objects
  let currentStream = null; //< CurrentStream properties like layer info
  let lastTime = Date.now();

  // Pads strings to a certain length using '0'. Handy for drawing time-related stuff
  const zPad = (v, l) => {
    while ((v + "").length < l) {
      v = "0" + v;
    }
    return v;
  };

  // Handler for incoming messages
  // eslint-disable-next-line no-restricted-globals
  self.onmessage = (e) => {
    // Whenever we receive a new OffscreenCanvas, restart animation loop and set dimensions
    if (e.data.evt == "onBroadcastCanvas") {
      broadcastCanvas = e.data.canvas;
      console.log("Received OffScreenCanvas for Broadcasting", broadcastCanvas);

      // Stop animation loop if we've got no broadcast info
      if (!broadcastCanvas) {
        if (broadcastAnimationRef) {
          cancelAnimationFrame(broadcastAnimationRef);
        }
        return;
      }
      broadcastWidth = e.data.width;
      broadcastHeight = e.data.height;
      broadcastCanvasContext = broadcastCanvas.getContext("2d");
      // Start animation loop if it wasn't active
      if (broadcastAnimationRef) {
        cancelAnimationFrame(broadcastAnimationRef);
      }
      broadcastAnimationRef = requestAnimationFrame(animateBroadcast);
      return;
    }

    // Receiving VideoFrame's we've requested
    if (e.data.evt == "onFrame") {
      const index = e.data.index;
      if (index >= lastFrames.length) {
        return;
      }
      // Deallocate any VideoFrame we will be overwriting
      if (lastFrames[index]) {
        lastFrames[index].close();
      }
      lastFrames[index] = e.data.frame;
      return;
    }

    // For each update to layers and properties
    if (e.data.evt == "onCurrentStream") {
      let requiredLayers;
      currentStream = e.data.currentStream;
      if (!currentStream) {
        requiredLayers = 0;
      } else if (!currentStream.isScene) {
        requiredLayers = 1;
      } else if (currentStream.layers?.length) {
        requiredLayers = currentStream.layers?.length;
      }
      // Lazily check for a major change, in which case we reset all VideoFrames
      if (requiredLayers != lastFrames.length) {
        for (const frame of lastFrames) {
          if (frame) {
            frame.close();
          }
        }
        lastFrames = [];
        while (requiredLayers) {
          lastFrames.push(null);
          requiredLayers--;
        }
      }

      // Stop animation loop and halt if we've got no broadcast info
      if (!broadcastCanvas) {
        if (broadcastAnimationRef) {
          cancelAnimationFrame(broadcastAnimationRef);
        }
        return;
      }

      // Start animation loop if it's not active at this point
      if (!broadcastAnimationRef) {
        broadcastAnimationRef = requestAnimationFrame(animateBroadcast);
      }
      return;
    }

    // When we receive a stop command halt the animation loop
    if (e.data.evt == "halt") {
      console.log("Halting web worker");
      if (broadcastAnimationRef) {
        cancelAnimationFrame(broadcastAnimationRef);
      }
      return;
    }

    console.log("Unknown command: " + e.data);
    return;
  };

  // Keeps requesting new VideoFrame's and drawing the scene to the offscreen BroadcastCanvas
  const animateBroadcast = (time) => {
    if (broadcastCanvasContext == null) {
      console.log("Stopping animation loop due to missing broadcastCanvas");
      return;
    }

    // If not enough time has passed, wait
    let now = Date.now();
    let delta = now - lastTime.current;
    // Restrict animation loop to 25 FPS, down to 10 FPS if using web workers
    var fps = 30;
    var interval = 1000 / fps;
    if (delta < interval) {
      if (broadcastAnimationRef != null) {
        broadcastAnimationRef = requestAnimationFrame(animateBroadcast);
      }
      return;
    }
    lastTime.current = now - (delta % interval);

    // Request a new set of frames while we draw the current buffer
    postMessage({ evt: "getFrames" }, []);

    const width = broadcastWidth;
    const height = broadcastHeight;
    const color = currentStream?.properties?.backgroundColor || "#434c5e";
    // Resize canvas if dimensions change
    if (broadcastCanvas.height != height) {
      broadcastCanvas.height = height;
    }
    if (broadcastCanvas.width != width) {
      broadcastCanvas.width = width;
    }

    // Reset opacity
    broadcastCanvasContext.globalAlpha = 1;

    // Clear canvas
    broadcastCanvasContext.clearRect(0, 0, width, height);
    broadcastCanvasContext.fillStyle = color;
    broadcastCanvasContext.fillRect(0, 0, width, height);

    // If we've got nothing to draw, we've finished this animation loop early
    if (!currentStream) {
      if (broadcastAnimationRef != null) {
        broadcastAnimationRef = requestAnimationFrame(animateBroadcast);
      }
      return;
    }

    // Draw buffered video frames
    if (lastFrames.length) {
      if (currentStream.isScene) {
        if (currentStream.layers.length == lastFrames.length) {
          for (var i = 0; i < lastFrames.length; i++) {
            const layerInfo = currentStream.layers[i];
            if (!lastFrames[i]) {
              // Question mark in the center
              broadcastCanvasContext.textBaseline = "middle";
              broadcastCanvasContext.textAlign = "center";
              broadcastCanvasContext.fillStyle = "rgba(229, 233, 240, 0.7)";
              const pixelSize = layerInfo.properties.width / 4;
              broadcastCanvasContext.font =
                "bold " + pixelSize + "px sans-serif";
              const text = "?";
              broadcastCanvasContext.fillText(
                text,
                layerInfo.properties.x + layerInfo.properties.width / 2,
                layerInfo.properties.y + layerInfo.properties.height / 2
              );
              // Shaded background
              broadcastCanvasContext.fillStyle = "rgba(229, 233, 240, 0.2)";
              broadcastCanvasContext.fillRect(
                layerInfo.properties.x,
                layerInfo.properties.y,
                layerInfo.properties.width,
                layerInfo.properties.height
              );
              // Outline on top
              broadcastCanvasContext.strokeStyle = "#d08770";
              broadcastCanvasContext.lineWidth = 5;
              broadcastCanvasContext.beginPath();
              broadcastCanvasContext.strokeRect(
                layerInfo.properties.x + 3 / 2,
                layerInfo.properties.y + 3 / 2,
                layerInfo.properties.width - 3,
                layerInfo.properties.height - 3
              );
              broadcastCanvasContext.closePath();
              continue;
            }
            broadcastCanvasContext.globalAlpha = parseFloat(
              layerInfo.properties.opacity / 100
            );
            let pos = {
              x: layerInfo.hiddenProperties.cropStartX,
              y: layerInfo.hiddenProperties.cropStartY,
              width: Math.min(
                layerInfo.hiddenProperties.cropWidth,
                lastFrames[i].codedWidth - layerInfo.hiddenProperties.cropStartX
              ),
              height: Math.min(
                layerInfo.hiddenProperties.cropHeight,
                lastFrames[i].codedHeight -
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
            broadcastCanvasContext.drawImage(
              lastFrames[i],
              pos.x,
              pos.y,
              pos.width,
              pos.height,
              layerInfo.properties.x,
              layerInfo.properties.y,
              layerInfo.properties.width,
              layerInfo.properties.height
            );
          }
        }
      } else {
        if (lastFrames[0]) {
          broadcastCanvasContext.drawImage(lastFrames[0], 0, 0, width, height);
        }
      }
    }
    broadcastCanvasContext.globalAlpha = 1;

    // Draw date-time object to the center of the canvas
    if (currentStream.properties?.drawClock) {
      broadcastCanvasContext.fillStyle =
        currentStream.properties?.gridColor || "#000000";
      broadcastCanvasContext.textBaseline = "middle";
      broadcastCanvasContext.textAlign = "center";
      broadcastCanvasContext.font = "bold 32px sans-serif";

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
      broadcastCanvasContext.fillText(dt, width / 2, height / 2);
    }

    // Request next frame if the animation loop is still active
    if (broadcastAnimationRef != null) {
      broadcastAnimationRef = requestAnimationFrame(animateBroadcast);
    }
  };
};
