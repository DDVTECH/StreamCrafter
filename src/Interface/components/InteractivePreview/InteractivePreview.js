/*

Renders the interactive preview which is being broadcasted

*/
import React from 'react';
import { useEffect, useRef, useCallback, useState } from "react";
const padding = 100;
const outlineWidth = 5;
const gridLineWidth = 1;
const closeEnoughThreshold = 50;
const minSize = 50;
const patternCanvasSize = 400;

const InteractivePreview = (props) => {
  const localVideo = useRef(); //< local preview canvas
  const localAnimation = useRef(); //< ref for animation loop
  const patternCanvas = useRef(); //< ref diagonal lines pattern

  // Dragging and clicking
  const snapGrid = useRef();
  const preview = useRef();
  const leftAction = useRef();
  const rightAction = useRef();
  const dragAction = useRef();
  const dragStart = useRef();
  const snapStart = useRef();
  const snapEnd = useRef();
  const [cursor, setCursor] = useState("pointer");

  /*

    Handle mouse input

  */

  const handleMouseDown = useCallback(
    (e) => {
      if (e.type == "touchstart") {
        if (!leftAction.current) {
          leftAction.current = e;
          dragAction.current = e;
          function toggleSnapGrid() {
            // Cancelled
            if (!leftAction.current?.touches?.length) {
              return;
            }
            let isSnapping = false;
            // No drag at all
            if (!dragAction.current?.touches?.length) {
              isSnapping = true;
            } else {
              // Else check drag distance
              if (
                Math.abs(
                  leftAction.current.touches[0].clientX -
                    dragAction.current.touches[0].clientX
                ) < 20 &&
                Math.abs(
                  leftAction.current.touches[0].clientY -
                    dragAction.current.touches[0].clientY
                ) < 20
              ) {
                isSnapping = true;
              }
            }
            if (isSnapping) {
              snapGrid.current = true;
              leftAction.current.snapNearestCell = true;
              console.log("enable snap-grid touch mode");
            }
          }
          setTimeout(toggleSnapGrid, 500);
        }
      } else if (e.button == 0) {
        if (!leftAction.current) {
          leftAction.current = e;
        }
      } else if (e.button == 2) {
        if (!rightAction.current) {
          rightAction.current = e;
        }
      }
      if (leftAction.current && rightAction.current) {
        snapGrid.current = true;
        console.log("enable snap-grid mode");
      }
    },
    [
      props.mediaStreams,
      props.currentStream,
      props.currentStream?.layers?.length,
      cursor,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
      let ignore = false;
      let hadAction = false;
      if (e.type == "touchend") {
        if (snapGrid.current) {
          snapGrid.current = false;
          console.log("disable snap-grid mode");
          ignore = true;
        }
        if (leftAction.current) {
          hadAction = true;
          leftAction.current = null;
        }
      } else if (e.button == 0) {
        if (leftAction.current != null && rightAction.current != null) {
          console.log("switch to snap-grid resize mode");
          if (cursor != "nwse-resize") {
            setCursor("nwse-resize");
          }
        } else if (snapGrid.current) {
          snapGrid.current = false;
          console.log("disable snap-grid mode");
          ignore = true;
          if (cursor != "pointer") {
            setCursor("pointer");
          }
        }
        if (leftAction.current) {
          hadAction = true;
          leftAction.current = null;
        }
      } else if (e.button == 2) {
        if (leftAction.current != null && rightAction.current != null) {
          console.log("switch to snap-grid resize mode");
          if (cursor != "nwse-resize") {
            setCursor("nwse-resize");
          }
        } else if (snapGrid.current) {
          snapGrid.current = false;
          console.log("disable snap-grid mode");
          ignore = true;
          if (cursor != "pointer") {
            setCursor("pointer");
          }
        }
        if (rightAction.current) {
          hadAction = true;
          rightAction.current = null;
        }
      }
      // If we have a selected layer, we might need to move it
      if (preview.current) {
        if (!leftAction.current && !rightAction.current) {
          let newObj = props.currentStream;
          for (var idx = 0; idx < newObj.layers.length; idx++) {
            if (props.selectedLayer.id == newObj.layers[idx].id) {
              newObj.layers[idx].properties.x = preview.current.properties.x;
              newObj.layers[idx].properties.y = preview.current.properties.y;
              newObj.layers[idx].properties.width =
                preview.current.properties.width;
              newObj.layers[idx].properties.height =
                preview.current.properties.height;
              props.mutateMediaStream(newObj);
              break;
            }
          }
          if (cursor != "pointer") {
            setCursor("pointer");
          }
          dragStart.current = null;
          preview.current = null;
        }
        return;
      }

      if (ignore) {
        if (cursor != "pointer") {
          setCursor("pointer");
        }
        return;
      }
      // No drag action - cycle layer
      if (hadAction) {
        console.log("click action");
        const coords = normalizeMouse(e.clientX, e.clientY);
        // If a left mouse button, we want to cycle layers
        const newLayer = getLayerIndex(
          coords.x,
          coords.y,
          e.button != 2,
          false
        );
        if (newLayer < 0) {
          console.log("unselecting layer");
          props.unselectLayer();
          if (cursor != "pointer") {
            setCursor("pointer");
          }
          return;
        }
        let withContextMenu = e.button == 2;
        if (
          props.selectedLayer &&
          props.selectedLayer.id == props.currentStream.layers[newLayer].id
        ) {
          console.log("hit on selected layer " + newLayer);
          if (!withContextMenu) {
            console.log("unselecting layer " + newLayer);
            props.setSelectedLayer(null);
          } else {
            console.log("opening context menu for layer " + newLayer);
            props.selectLayerAndConfig(newLayer, e);
          }
        } else {
          console.log("hit on unselected layer " + newLayer);
          console.log("selecting layer " + newLayer);
          if (withContextMenu) {
            console.log("opening context menu for layer " + newLayer);
            props.selectLayerAndConfig(newLayer, e);
          } else {
            props.setSelectedLayer(props.currentStream.layers[newLayer]);
          }
        }
        return;
      }
      if (props.selectedLayer) {
        if (cursor != "grab") {
          setCursor("grab");
        }
      } else {
        if (cursor != "pointer") {
          setCursor("pointer");
        }
      }
    },
    [
      props.mediaStreams,
      props.currentStream,
      props.currentStream?.layers?.length,
      props.selectedLayer,
      cursor,
    ]
  );

  const handleMouseMove = useCallback(
    (e) => {
      dragAction.current = e;
      // There's nothing to manipulate
      if (!props.broadcastCanvas?.properties) {
        return;
      }
      const coords = normalizeMouse(
        e.clientX || (e.touches?.length && e.touches[0].clientX),
        e.clientY || (e.touches?.length && e.touches[0].clientY)
      );
      // Determine if the cursor is at a position to move or resize a layer
      let isMoveAction = false; //< VS resize action if near a corner/edge
      let onWest = false;
      let onNorth = false;
      let onEast = false;
      let onSouth = false;
      // Check if near any layer
      const newLayer = getLayerIndex(
        coords.x,
        coords.y,
        false,
        props.selectedLayer?.properties ? true : false
      );
      const checkValues = (properties) => {
        if (!properties) {
          return;
        }
        // Determine if it would be a move or resize action
        const distTopLeft = getDistance(
          coords.x,
          coords.y,
          properties.x,
          properties.y
        );
        const distBotLeft = getDistance(
          coords.x,
          coords.y,
          properties.x,
          properties.y + properties.height
        );
        const distTopRight = getDistance(
          coords.x,
          coords.y,
          properties.x + properties.width,
          properties.y
        );
        const distBotRight = getDistance(
          coords.x,
          coords.y,
          properties.x + properties.width,
          properties.y + properties.height
        );
        // Check if it's near a corner
        let threshold = closeEnoughThreshold;
        while (
          threshold > properties.width / 3 ||
          threshold > properties.height / 3
        ) {
          threshold /= 2;
        }
        if (distTopLeft < threshold) {
          onNorth = true;
          onWest = true;
          return;
        } else if (distBotLeft < threshold) {
          onSouth = true;
          onWest = true;
          return;
        } else if (distTopRight < threshold) {
          onNorth = true;
          onEast = true;
          return;
        } else if (distBotRight < threshold) {
          onSouth = true;
          onEast = true;
          return;
        }
        // Check if it's near an edge
        if (Math.abs(coords.x - properties.x) < threshold) {
          onWest = true;
          return;
        } else if (
          Math.abs(coords.y - (properties.y + properties.height)) < threshold
        ) {
          onSouth = true;
          return;
        } else if (
          Math.abs(coords.x - (properties.x + properties.width)) < threshold
        ) {
          onEast = true;
          return;
        } else if (Math.abs(coords.y - properties.y) < threshold) {
          onNorth = true;
          return;
        }
        // Else it's just a move action
        isMoveAction = true;
        return;
      };
      // First check current layer if it exists
      if (newLayer >= 0) {
        checkValues(props.currentStream?.layers[newLayer]?.properties);
      }
      // We're only hovering somewhere - just set a cursor hint
      if (!leftAction.current && !rightAction.current) {
        if (newLayer >= 0) {
          if (isMoveAction) {
            if (cursor != "grab") {
              setCursor("grab");
            }
            return;
          }
          if (onNorth) {
            if (onWest) {
              if (cursor != "nw-resize") {
                setCursor("nw-resize");
              }
              return;
            } else if (onEast) {
              if (cursor != "ne-resize") {
                setCursor("ne-resize");
              }
              return;
            }
            if (cursor != "n-resize") {
              setCursor("n-resize");
            }
            return;
          }
          if (onSouth) {
            if (onWest) {
              if (cursor != "sw-resize") {
                setCursor("sw-resize");
              }
              return;
            } else if (onEast) {
              if (cursor != "se-resize") {
                setCursor("se-resize");
              }
              return;
            }
            if (cursor != "s-resize") {
              setCursor("s-resize");
            }
            return;
          }
          if (onWest) {
            if (cursor != "w-resize") {
              setCursor("w-resize");
            }
            return;
          } else if (onEast) {
            if (cursor != "e-resize") {
              setCursor("e-resize");
            }
            return;
          }
        }
        if (cursor != "pointer") {
          setCursor("pointer");
        }
        return;
      }
      // We're in snap-grid resize or snap-grid move mode
      if (snapGrid.current) {
        if (leftAction.current.snapNearestCell) {
          console.log("snapping to cell");
          props.setSelectedLayer(props.currentStream.layers[newLayer]);
          preview.current = {
            id: props.currentStream.layers[newLayer].id,
            srcId: props.currentStream.layers[newLayer].srcId,
            properties: JSON.parse(
              JSON.stringify(props.currentStream.layers[newLayer].properties)
            ),
            hiddenProperties: JSON.parse(
              JSON.stringify(
                props.currentStream.layers[newLayer].hiddenProperties
              )
            ),
          };
          const xCellSize = parseInt(
            props.broadcastCanvas?.properties?.width / 8
          );
          const yCellSize = parseInt(
            props.broadcastCanvas?.properties?.height / 8
          );
          const xFactor = Math.round(preview.current.properties.x / xCellSize);
          const yFactor = Math.round(preview.current.properties.y / yCellSize);
          snapStart.current = {
            x: xFactor * xCellSize,
            y: yFactor * yCellSize,
          };
          // snap top left corner
          preview.current.properties.x = snapStart.current.x;
          preview.current.properties.y = snapStart.current.y;
          leftAction.current.snapNearestCell = null;
        } else if (
          !preview.current?.properties ||
          !props.selectedLayer?.properties
        ) {
          // We lost our new preview object - abort
          snapGrid.current = false;
          leftAction.current = false;
          rightAction.current = false;
          return;
        }

        const xCellSize = parseInt(
          props.broadcastCanvas?.properties?.width / 8
        );
        const yCellSize = parseInt(
          props.broadcastCanvas?.properties?.height / 8
        );
        const xFactor = parseInt(coords.x / xCellSize);
        const yFactor = parseInt(coords.y / yCellSize);

        if (leftAction.current && rightAction.current) {
          snapStart.current = {
            x: xFactor * xCellSize,
            y: yFactor * yCellSize,
          };
          // If both mouse buttons are still down: move layer - snap top left corner
          preview.current.properties.x = snapStart.current.x;
          preview.current.properties.y = snapStart.current.y;
          if (cursor != "move") {
            setCursor("move");
          }
          return;
        }
        snapEnd.current = {
          x: xFactor * xCellSize,
          y: yFactor * yCellSize,
        };
        // Determine top left corner and bot right corner
        let topLeft = {};
        let botRight = {};
        if (snapStart.current.x > snapEnd.current.x) {
          topLeft.x = snapEnd.current.x;
          botRight.x = snapStart.current.x + xCellSize;
        } else {
          topLeft.x = snapStart.current.x;
          botRight.x = snapEnd.current.x + xCellSize;
        }
        if (snapStart.current.y > snapEnd.current.y) {
          topLeft.y = snapEnd.current.y;
          botRight.y = snapStart.current.y + yCellSize;
        } else {
          topLeft.y = snapStart.current.y;
          botRight.y = snapEnd.current.y + yCellSize;
        }
        // If only the left button is still down: resize layer - snap both corners
        preview.current.properties.x = topLeft.x;
        preview.current.properties.y = topLeft.y;
        preview.current.properties.width = botRight.x - topLeft.x;
        preview.current.properties.height = botRight.y - topLeft.y;
        // Set cursor hint
        let onWest = true;
        let onNorth = true;
        if (
          coords.x >
          preview.current.properties.x + preview.current.properties.width / 2
        ) {
          onWest = false;
        }
        if (
          coords.y >
          preview.current.properties.y + preview.current.properties.height / 2
        ) {
          onNorth = false;
        }
        if (onWest) {
          if (onNorth) {
            if (cursor != "nw-resize") {
              setCursor("nw-resize");
            }
          } else {
            if (cursor != "sw-resize") {
              setCursor("sw-resize");
            }
          }
        } else {
          if (onNorth) {
            if (cursor != "ne-resize") {
              setCursor("ne-resize");
            }
          } else {
            if (cursor != "se-resize") {
              setCursor("se-resize");
            }
          }
        }
        return;
      }
      // Dragging mouse button not near a corner/edge: drag move layer action
      if (
        dragStart.current?.isMoveAction &&
        preview.current?.properties &&
        props.selectedLayer?.properties
      ) {
        console.log("update drag move action");
        let newX = Math.min(
          props.broadcastCanvas.properties.width -
            preview.current.properties.width,
          coords.x - preview.current.properties.width / 2
        );
        if (newX < 0) {
          newX = 0;
        }
        preview.current.properties.x = newX;
        let newY = Math.min(
          props.broadcastCanvas.properties.height -
            preview.current.properties.height,
          coords.y - preview.current.properties.height / 2
        );
        if (newY < 0) {
          newY = 0;
        }
        preview.current.properties.y = newY;
        if (cursor != "grabbing") {
          setCursor("grabbing");
        }
        return;
      }
      // Dragging mouse button near a corner/edge
      if (
        dragStart.current?.isResizeAction &&
        preview.current?.properties &&
        props.selectedLayer?.properties
      ) {
        console.log("update drag resize action");
        // Else continue as usual
        const deltaX = preview.current.properties.x - coords.x;
        const deltaY = preview.current.properties.y - coords.y;
        if (dragStart.current.onNorth) {
          if (dragStart.current.onWest) {
            if (cursor != "nw-resize") {
              setCursor("nw-resize");
            }
            const newWidth = preview.current.properties.width + deltaX;
            const newHeight = preview.current.properties.height + deltaY;
            if (newWidth > minSize) {
              preview.current.properties.x = coords.x;
              preview.current.properties.width = newWidth;
            }
            if (newHeight > minSize) {
              preview.current.properties.y = coords.y;
              preview.current.properties.height = newHeight;
            }
            return;
          } else if (dragStart.current.onEast) {
            if (cursor != "ne-resize") {
              setCursor("ne-resize");
            }
            const newWidth = coords.x - preview.current.properties.x;
            const newHeight = preview.current.properties.height + deltaY;
            if (newWidth > minSize) {
              preview.current.properties.width = newWidth;
            }
            if (newHeight > minSize) {
              preview.current.properties.y = coords.y;
              preview.current.properties.height = newHeight;
            }
            return;
          }
          if (cursor != "n-resize") {
            setCursor("n-resize");
          }
          const newHeight = preview.current.properties.height + deltaY;
          if (newHeight > minSize) {
            preview.current.properties.y = coords.y;
            preview.current.properties.height = newHeight;
          }
          return;
        }
        if (dragStart.current.onSouth) {
          if (dragStart.current.onWest) {
            if (cursor != "sw-resize") {
              setCursor("sw-resize");
            }
            const newWidth = preview.current.properties.width + deltaX;
            const newHeight = coords.y - preview.current.properties.y;
            if (newWidth > minSize) {
              preview.current.properties.x = coords.x;
              preview.current.properties.width = newWidth;
            }
            if (newHeight > minSize) {
              preview.current.properties.height = newHeight;
            }
            return;
          } else if (dragStart.current.onEast) {
            if (cursor != "se-resize") {
              setCursor("se-resize");
            }
            const newWidth = coords.x - preview.current.properties.x;
            const newHeight = coords.y - preview.current.properties.y;
            if (newWidth > minSize) {
              preview.current.properties.width = newWidth;
            }
            if (newHeight > minSize) {
              preview.current.properties.height = newHeight;
            }
            return;
          }
          if (cursor != "s-resize") {
            setCursor("s-resize");
          }
          const newHeight = coords.y - preview.current.properties.y;
          if (newHeight > minSize) {
            preview.current.properties.height = newHeight;
          }
          return;
        }
        if (dragStart.current.onWest) {
          if (cursor != "w-resize") {
            setCursor("w-resize");
          }
          const newWidth = preview.current.properties.width + deltaX;
          if (newWidth > minSize) {
            preview.current.properties.x = coords.x;
            preview.current.properties.width = newWidth;
          }
          return;
        } else if (dragStart.current.onEast) {
          if (cursor != "e-resize") {
            setCursor("e-resize");
          }
          const newWidth = coords.x - preview.current.properties.x;
          if (newWidth > minSize) {
            preview.current.properties.width = newWidth;
          }
          return;
        }
        return;
      }
      // We're starting a drag or resize action
      if (newLayer < 0) {
        console.log("no action");
        snapGrid.current = false;
        leftAction.current = false;
        rightAction.current = false;
        return;
      }
      if (!props.currentStream.layers[newLayer]) {
        return;
      }
      props.setSelectedLayer(props.currentStream.layers[newLayer]);
      if (isMoveAction) {
        console.log("start drag move action");
        dragStart.current = leftAction.current || rightAction.current;
        preview.current = {
          id: props.currentStream.layers[newLayer].id,
          srcId: props.currentStream.layers[newLayer].srcId,
          properties: JSON.parse(
            JSON.stringify(props.currentStream.layers[newLayer].properties)
          ),
          hiddenProperties: JSON.parse(
            JSON.stringify(
              props.currentStream.layers[newLayer].hiddenProperties
            )
          ),
        };
        if (cursor != "grabbing") {
          setCursor("grabbing");
        }
        dragStart.current.isMoveAction = true;
        return;
      }
      console.log("start drag resize action");
      dragStart.current = leftAction.current || rightAction.current;
      preview.current = {
        id: props.currentStream.layers[newLayer].id,
        srcId: props.currentStream.layers[newLayer].srcId,
        properties: JSON.parse(
          JSON.stringify(props.currentStream.layers[newLayer].properties)
        ),
        hiddenProperties: JSON.parse(
          JSON.stringify(props.currentStream.layers[newLayer].hiddenProperties)
        ),
      };
      // Save which corner/edge was initially clicked on
      dragStart.current.onWest = onWest;
      dragStart.current.onNorth = onNorth;
      dragStart.current.onEast = onEast;
      dragStart.current.onSouth = onSouth;
      dragStart.current.isResizeAction = true;
    },
    [
      props.mediaStreams,
      props.currentStream,
      props.currentStream?.layers?.length,
      props.selectedLayer,
      cursor,
      props.broadcastCanvas?.properties,
    ]
  );

  useEffect(() => {
    if (!props.currentStream?.isScene) {
      return;
    }
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
    localVideo.current.addEventListener("mousedown", handleMouseDown);
    localVideo.current.addEventListener("mouseup", handleMouseUp);
    localVideo.current.addEventListener("mousemove", handleMouseMove);
    localVideo.current.addEventListener("touchstart", touchStart);
    localVideo.current.addEventListener("touchmove", touchMove);
    localVideo.current.addEventListener("touchend", touchEnd);
    localVideo.current.addEventListener("touchcancel", handleMouseUp);
    localVideo.current.addEventListener("touchleave", handleMouseUp);
    return () => {
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
  }, [localVideo.current, handleMouseDown, handleMouseUp, handleMouseMove]);

  const catchDefault = (event) => {
    event.preventDefault(); //< no context menu
  };

  // Mouse events
  const normalizeMouse = (x, y) => {
    const currentCoord = { x: x, y: y };
    const rect = localVideo.current.getBoundingClientRect();
    const xScale =
      (props.broadcastCanvas?.properties?.width + padding + padding) /
      rect.width;
    const yScale =
      (props.broadcastCanvas?.properties?.height + padding + padding) /
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
    if (currentCoord.x >= props.broadcastCanvas?.properties?.width) {
      currentCoord.x = props.broadcastCanvas?.properties?.width - 1;
    }
    if (currentCoord.y < 0) {
      currentCoord.y = 0;
    }
    if (currentCoord.y >= props.broadcastCanvas?.properties?.height) {
      currentCoord.y = props.broadcastCanvas?.properties?.height - 1;
    }

    return { x: Math.round(currentCoord.x), y: Math.round(currentCoord.y) };
  };

  const getDistance = (x1, y1, x2, y2) => {
    let y = x2 - x1;
    let x = y2 - y1;
    return Math.sqrt(x * x + y * y);
  };

  // Cycles to the next layer under the mouse position
  const getLayerIndex = useCallback(
    (x, y, cycle, selectClose) => {
      if (!props.currentStream || !props.currentStream?.layers?.length) {
        return -1;
      }

      let layersToCheck = props.currentStream.layers.length;
      let layerIdx = props.currentStream.layers.length - 1;
      // Start at the index of the selected layer
      if (props.selectedLayer) {
        for (var idx = 0; idx < props.currentStream.layers.length; idx++) {
          if (props.selectedLayer.id == props.currentStream.layers[idx].id) {
            layerIdx = idx;
            break;
          }
        }
        // In some cases we want to start looking on the layer below the selected layer
        if (cycle) {
          layerIdx -= 1;
          if (layerIdx < 0) {
            layerIdx = props.currentStream.layers.length - 1;
          }
        }
      }

      while (layersToCheck) {
        const thisLayer = props.currentStream.layers[layerIdx];
        if (!thisLayer) {
          console.log("Warning: no layer info to check...");
          layerIdx -= 1;
          if (layerIdx < 0) {
            layerIdx = props.currentStream.layers.length - 1;
          }
          layersToCheck--;
          continue;
        }

        let hit = true;
        let padding = closeEnoughThreshold;
        while (
          padding > thisLayer.properties.width / 3 ||
          padding > thisLayer.properties.height / 3
        ) {
          padding /= 2;
        }
        if (!selectClose) {
          padding = 0;
        }
        if (
          x + padding < thisLayer.properties.x ||
          x - padding > thisLayer.properties.x + thisLayer.properties.width
        ) {
          hit = false;
        }
        if (
          y + padding < thisLayer.properties.y ||
          y - padding > thisLayer.properties.y + thisLayer.properties.height
        ) {
          hit = false;
        }

        if (hit) {
          return layerIdx;
        }

        layerIdx -= 1;
        if (layerIdx < 0) {
          layerIdx = props.currentStream.layers.length - 1;
        }
        layersToCheck--;
      }
      return -1;
    },
    [
      props.selectedLayer,
      props.currentStream,
      props.currentStream?.layers?.length,
    ]
  );

  /*

      Render MediaStream source and preview stuff -> broadcast canvas

  */

  const drawLayer = (layerInfo, onlyEffects, drawAutoCrop) => {
    const canvasContext = localVideo.current.getContext("2d");
    for (const srcStream of props.mediaStreams) {
      if (!layerInfo.properties.autoFit) {
        break;
      }
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

      let shavingsWidth = 0;
      let shavingsHeight = 0;
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

      const requiredRatio =
        layerInfo.properties.width / layerInfo.properties.height;
      const currentRatio = pos.width / pos.height;
      if (requiredRatio > currentRatio) {
        shavingsHeight = pos.height - pos.width / requiredRatio;
      } else if (requiredRatio < currentRatio) {
        shavingsWidth = pos.width - pos.height * requiredRatio;
      }

      // Draw selected layer on top
      if (!onlyEffects) {
        canvasContext.drawImage(
          srcStream.mediaDOMRef.current,
          pos.x + shavingsWidth / 2,
          pos.y + shavingsHeight / 2,
          pos.width - shavingsWidth,
          pos.height - shavingsHeight,
          padding + layerInfo.properties.x,
          padding + layerInfo.properties.y,
          layerInfo.properties.width,
          layerInfo.properties.height
        );
      }

      // Mark area that's cropped off
      if (shavingsHeight && drawAutoCrop) {
        // Apply pattern
        if (patternCanvas.current) {
          canvasContext.fillStyle = canvasContext.createPattern(
            patternCanvas.current,
            "repeat"
          );
          canvasContext.fillRect(
            padding + layerInfo.properties.x,
            padding + layerInfo.properties.y - shavingsHeight / 2,
            layerInfo.properties.width,
            shavingsHeight / 2
          );
          canvasContext.fillRect(
            padding + layerInfo.properties.x,
            padding + layerInfo.properties.y + layerInfo.properties.height,
            layerInfo.properties.width,
            shavingsHeight / 2
          );
        }
        // Apply shaded area
        canvasContext.fillStyle = "rgba(229, 233, 240, 0.2)";
        canvasContext.fillRect(
          padding + layerInfo.properties.x,
          padding + layerInfo.properties.y - shavingsHeight / 2,
          layerInfo.properties.width,
          shavingsHeight / 2
        );
        canvasContext.fillRect(
          padding + layerInfo.properties.x,
          padding + layerInfo.properties.y + layerInfo.properties.height,
          layerInfo.properties.width,
          shavingsHeight / 2
        );
      }
      if (shavingsWidth && drawAutoCrop) {
        // Apply pattern
        if (patternCanvas.current) {
          canvasContext.fillStyle = canvasContext.createPattern(
            patternCanvas.current,
            "repeat"
          );
          canvasContext.fillRect(
            padding + layerInfo.properties.x - shavingsWidth / 2,
            padding + layerInfo.properties.y,
            shavingsWidth / 2,
            layerInfo.properties.height
          );
          canvasContext.fillRect(
            padding + layerInfo.properties.x + layerInfo.properties.width,
            padding + layerInfo.properties.y,
            shavingsWidth / 2,
            layerInfo.properties.height
          );
        }
        // Apply shaded area
        canvasContext.fillStyle = "rgba(229, 233, 240, 0.2)";
        canvasContext.fillRect(
          padding + layerInfo.properties.x - shavingsWidth / 2,
          padding + layerInfo.properties.y,
          shavingsWidth / 2,
          layerInfo.properties.height
        );
        canvasContext.fillRect(
          padding + layerInfo.properties.x + layerInfo.properties.width,
          padding + layerInfo.properties.y,
          shavingsWidth / 2,
          layerInfo.properties.height
        );
      }
    }
  };

  const animatePreview = useCallback(
    (time) => {
      let width = 256;
      let height = 256;
      let color = "#3b4252";
      let sendEmptyVideo = true;
      if (props.currentStream?.properties) {
        color = props.currentStream.properties.backgroundColor;
        sendEmptyVideo = false;
      }
      if (props.broadcastCanvas?.properties) {
        width = props.broadcastCanvas.properties.width;
        height = props.broadcastCanvas.properties.height;
      }
      const canvasContext = localVideo.current.getContext("2d");

      // Reset opacity
      canvasContext.globalAlpha = 1;

      // Clear canvas
      canvasContext.clearRect(
        0,
        0,
        width + padding + padding,
        height + padding + padding
      );

      // Update video
      canvasContext.fillStyle = color;
      canvasContext.fillRect(padding, padding, width, height);
      if (!sendEmptyVideo) {
        canvasContext.drawImage(
          props.broadcastCanvas.mediaDOMRef.current,
          padding,
          padding,
          width,
          height
        );
      }

      // Draw selected layer effects
      if (props.selectedLayer?.properties) {
        drawLayer(props.selectedLayer, true, preview.current ? false : true);
        // Lastly outline on top
        canvasContext.strokeStyle =
          props.currentStream?.properties?.gridColor || "#AAAAFF";
        canvasContext.globalAlpha = 0.8;
        canvasContext.lineWidth = outlineWidth;
        canvasContext.beginPath();
        canvasContext.strokeRect(
          padding + props.selectedLayer.properties.x + outlineWidth / 2,
          padding + props.selectedLayer.properties.y + outlineWidth / 2,
          props.selectedLayer.properties.width - outlineWidth,
          props.selectedLayer.properties.height - outlineWidth
        );
        canvasContext.closePath();
      }

      // Draw preview of layer edit
      if (preview.current) {
        drawLayer(preview.current, false, true);
      }

      function drawGrid(startX, startY, endX, endY, gridCellSize) {
        canvasContext.lineWidth = gridLineWidth;
        canvasContext.beginPath();

        const xCellSize = (endX - startX) / gridCellSize;
        const yCellSize = (endY - startY) / gridCellSize;

        for (let x = startX; x <= endX; x += xCellSize) {
          canvasContext.moveTo(x, startY);
          canvasContext.lineTo(x, endY);
        }

        for (let y = startY; y <= endY; y += yCellSize) {
          canvasContext.moveTo(startX, y);
          canvasContext.lineTo(endX, y);
        }

        canvasContext.stroke();
        canvasContext.closePath();
      }

      // Draw snap-grid
      if (snapGrid.current) {
        canvasContext.strokeStyle =
          props.currentStream?.properties?.gridColor || "#AAAAFF";
        canvasContext.globalAlpha = 0.5;
        drawGrid(padding, padding, padding + width, padding + height, 8);
        canvasContext.globalAlpha = 1.0;
      }

      // Draw hint in the padded area
      let hint = "";
      // No sources at all
      if (!props.scenes && !props.mediaStreams.length) {
        hint = "Start crafting by adding a Scene or Media source";
      } else if (props.currentStream?.properties) {
        if (props.currentStream.isScene) {
          if (props.currentStream.layers.length) {
            hint = "'" + props.currentStream.properties.name +"' video editor";
          } else {
            if (!props.mediaStreams.length) {
              hint = "Add a source below to add to the scene";
            } else {
              hint = "Drag any source below to add it to the scene";
            }
          }
        } else {
          hint = "'" + props.currentStream.properties.name +"' video preview";
        }
      } else {
        // We have a source, but no scene
        if (!props.scenes) {
          hint = "Add a scene below to start crafting";
        } else {
          // We have a source and a scene
          hint = "Click on a video icon below to mark a scene or source as visible";
        }
      }
      canvasContext.fillStyle = "#e5e9f0";
      canvasContext.globalAlpha = 1.0;
      canvasContext.font = "bold " + padding / 4 + "px sans-serif";
      canvasContext.textBaseline = "middle";
      canvasContext.textAlign = "center";
      canvasContext.fillText(hint, padding + width / 2, padding / 2);

      if (localAnimation.current !== null) {
        localAnimation.current = requestAnimationFrame(animatePreview);
      }
    },
    [
      props.selectedLayer,
      props.mediaStreams,
      props.currentStream,
      props.currentStream?.layers?.length,
      props.currentStream?.properties?.gridColor,
      props.broadcastCanvas?.id,
      props.scenes,
      patternCanvas.current,
    ]
  );

  useEffect(() => {
    if (!patternCanvas.current) {
      return;
    }
    console.log("Drawing pattern to hidden canvas");
    const bgCtx = patternCanvas.current.getContext("2d");
    bgCtx.globalAlpha = 0.3;
    var color1 = "#2e3440",
      color2 = "#d8dee9";
    var numberOfStripes = 10;
    for (var i = 0; i < numberOfStripes * 2; i++) {
      var thickness = patternCanvasSize / numberOfStripes;
      bgCtx.beginPath();
      bgCtx.strokeStyle = i % 2 ? color1 : color2;
      bgCtx.lineWidth = thickness;
      bgCtx.lineCap = "square";

      bgCtx.moveTo(i * thickness + thickness / 2 - patternCanvasSize, 0);
      bgCtx.lineTo(0 + i * thickness + thickness / 2, patternCanvasSize);
      bgCtx.stroke();
    }
  }, [patternCanvas.current]);

  // initialize:
  //  - canvas->mediaStreamRef for broadcasting
  //  - the mediaDOMRef for drawing video tracks to the canvas
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
    console.log("rendering broadcast preview canvas");
  }, [localVideo.current]);

  // (re)start animation loop
  useEffect(() => {
    if (localAnimation.current !== null) {
      cancelAnimationFrame(localAnimation.current);
    }
    localAnimation.current = requestAnimationFrame(animatePreview);
    return () => {
      cancelAnimationFrame(localAnimation.current);
    };
  }, [
    props.mediaStreams,
    props.selectedLayer,
    props.currentStream,
    props.currentStream?.layers,
    props.broadcastCanvas?.id,
    props.scenes,
    patternCanvas.current,
  ]);

  let width = 0;
  let height = 0;
  if (props.broadcastCanvas?.properties) {
    width = props.broadcastCanvas.properties.width;
    height = props.broadcastCanvas.properties.height;
  }

  let canvasCursor = cursor;
  if (!props.currentStream?.isScene) {
    canvasCursor = "default";
  }

  return (
    <div
      className="flex-parent flex-grow"
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flex: "1",
      }}
    >
      <canvas
        control="false"
        playsInline
        autoPlay={true}
        muted="muted"
        ref={localVideo}
        height={padding + padding + height}
        width={padding + padding + width}
        style={{
          maxWidth: "100vw",
          height: "100%",
          maxHeight: "calc(100vh - 30em)",
          cursor: canvasCursor,
        }}
        onClick={catchDefault}
        onContextMenu={catchDefault}
        onMouseLeave={(ev) => {
          if (!props.currentStream) {
            return;
          }
          if (preview.current) {
            let newObj = props.currentStream;
            for (var idx = 0; idx < newObj.layers.length; idx++) {
              if (props.selectedLayer.id == newObj.layers[idx].id) {
                newObj.layers[idx].properties.x = preview.current.properties.x;
                newObj.layers[idx].properties.y = preview.current.properties.y;
                newObj.layers[idx].properties.width =
                  preview.current.properties.width;
                newObj.layers[idx].properties.height =
                  preview.current.properties.height;
                props.mutateMediaStream(newObj);
                break;
              }
            }
            dragStart.current = null;
            leftAction.current = null;
            rightAction.current = null;
            preview.current = null;
            snapGrid.current = null;
            props.setSelectedLayer(null);
          }
        }}
        onDragOver={(ev) => ev.preventDefault()}
        onDrop={(ev) => {
          if (!props.currentStream) {
            return;
          }
          props.handleDrop(ev, "addToCanvas");
        }}
      ></canvas>
      <canvas
        hidden
        control="false"
        playsInline
        autoPlay={true}
        muted="muted"
        ref={patternCanvas}
        height={patternCanvasSize}
        width={patternCanvasSize}
      ></canvas>
    </div>
  );
};

export default InteractivePreview;
