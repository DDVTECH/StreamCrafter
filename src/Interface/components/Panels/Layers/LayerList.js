/*

Show available scenes to broadcast

*/
import React from 'react';
import { useState } from "react";
import LayerButton from "./LayerButton";
import { IoMenu, IoReturnUpBack } from "react-icons/io5";

const LayerList = (props) => {
  const [showPanel, setShowPanel] = useState(true);
  if (!props.currentStream?.layers?.length) {
    return;
  }
  let slides = [];
  props.currentStream.layers?.map((layer, i) => {
    let title = layer.properties.name || "#" + i;
    for (const mediaStream of props.mediaStreams) {
      if (layer.srcId == mediaStream.id) {
        title =
          layer.properties.name + " (" + mediaStream.properties.name + ")";
        break;
      }
    }
    slides.push(
      <LayerButton
        currentStream={props.currentStream}
        setSelectedLayer={props.setSelectedLayer}
        selectLayerAndConfig={props.selectLayerAndConfig}
        layerInfo={layer}
        index={i}
        title={title}
        isSelected={props.selectedLayer == layer}
        switchLayerPositions={props.switchLayerPositions}
      />
    );
  });

  const header = (
    <div
      className="flex-parent darkFg backgroundBorderBot"
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <button
        className="row-container action-button nopad noborder"
        onClick={() => setShowPanel(!showPanel)}
        style={{
          alignItems: "center",
          width: "unset",
          borderRadius: "0.3em",
          marginLeft: "0.2em",
        }}
      >
        {showPanel ? (
          <IoReturnUpBack className="maximized" style={{ height: "2em" }} />
        ) : (
          <IoMenu className="maximized" style={{ height: "2em" }} />
        )}
      </button>
      <h4 className="nopad" style={{ marginLeft: "1em", marginRight: "1em" }}>
        Layers
      </h4>
    </div>
  );

  if (!showPanel) {
    return (
      <div
        className="nopad row-container darkBg backgroundBorderRight"
        style={{
          width: "unset",
          overflowY: "auto",
          justifyContent: "space-between",
          position: "absolute",
          left: 0,
          top: "3em",
          height: "unset",
        }}
      >
        {header}
      </div>
    );
  }

  return (
    <div
      className="nopad row-container darkBg backgroundBorderRight"
      style={{
        width: "unset",
        overflowY: "auto",
        justifyContent: "space-between",
        position: "absolute",
        left: 0,
        top: "3em",
        height: "unset",
      }}
    >
      {header}
      <div className="row-container">
        {slides
          .slice(0)
          .reverse()
          .map((elem, i) => {
            return (
              <div
                key={"layer-item-" + i}
                style={{
                  display: "flex",
                  textAlign: "center",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  margin: "0.5em",
                }}
              >
                {elem}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LayerList;
