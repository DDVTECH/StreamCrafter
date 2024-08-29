/*

Show available streams to broadcast and creates Broadcasts

*/
import React from 'react';
import StreamButton from "./StreamButton";
import { IoVideocam } from "react-icons/io5";

const SourceList = (props) => {
  let slides = [];
  props.mediaStreams?.map((stream, i) => {
    let isLayer = false;
    if (!stream.hasVideo){
      return;
    }
    const thisLayers = props.currentStream?.layers || [];
    for (const thisLayer of thisLayers) {
      if (stream.id == thisLayer.srcId) {
        isLayer = true;
        break;
      }
    }
    slides.push(
      <StreamButton
        isPreview={stream == props.currentStream}
        streamObj={stream}
        // Setters for the state
        setCurrentSteam={props.setCurrentSteam}
        toggleShowStreamProperties={props.toggleShowStreamProperties}
        removeStream={props.removeStream}
        clearPreview={props.clearPreview}
        // Handle dragging/dropping buttons onto the canvas
        handleDrag={props.handleDrag}
        handleDrop={props.handleDrop}
        //
        isLayer={isLayer}
        isPushing={props.isPushing}
      />
    );
  });

  return (
    <div
      className="column-container darkBg column-container backgroundBorderTop backgroundBorderBot"
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        alignContent: "center",
      }}
    >
      <div
        className="column-container"
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          alignContent: "center",
          overflowX: "auto",
          width: "100%",
        }}
      >
        {slides.map((elem, i) => {
          return (
            <div
              key={"source-slide-" + i}
              style={{
                height: "8em",
                maxHeight: "8em",
                aspectRatio: "1",
                marginRight: "1em",
                marginTop: "1em",
                marginBottom: "1em",
                alignItems: "center",
                display: "flex",
                marginLeft: i == 0 ? "1em" : "",
              }}
            >
              {elem}
            </div>
          );
        })}
      </div>
      <button
        className="row-container action-button nopad noborder"
        onClick={props.toggleShowAddSource}
        style={{
          height: "calc(8em - 1em)",
          maxHeight: "calc(8em - 1em)",
          alignItems: "center",
          justifyContent: "space-between",
          width: "unset",
          padding: "1em",
          borderRadius: "0.3em",
          margin: "1em",
        }}
      >
        <h4 className="maximized nopad" style={{ flex: 1 }}>
          Connect
        </h4>
        <IoVideocam className="maximized" style={{ maxHeight: "4em" }}/>
      </button>
    </div>
  );
};

export default SourceList;
