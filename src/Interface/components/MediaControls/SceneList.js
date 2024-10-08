/*

Show available scenes to broadcast

*/
import React from "react";
import StreamButton from "./StreamButton";
import { IoLayers, IoGrid } from "react-icons/io5";

const SceneList = (props) => {
  let slides = [];
  props.scenes?.map((stream, i) => {
    slides.push(
      <StreamButton
        isPreview={stream == props.currentStream}
        streamObj={stream}
        // Setters for the state
        setCurrentSteam={props.setCurrentSteam}
        toggleShowStreamProperties={props.toggleShowStreamProperties}
        removeStream={props.removeStream}
        clearPreview={props.clearPreview}
        //
        isLayer={false}
        isPushing={props.isPushing}
      />
    );
  });

  return (
    <div
      className="column-container darkBg backgroundBorderTop backgroundBorderBot"
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
          {
            return (
              <div
                key={"scene-slide-" + i}
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
          }
        })}
      </div>
      {props.currentStream?.isScene && (
        <button
          className="row-container action-button nopad noborder"
          onClick={props.arrangeScene}
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
            Auto arrange
          </h4>
          <IoLayers className="maximized" style={{ maxHeight: "4em" }} />
        </button>
      )}
      <button
        className="row-container action-button nopad noborder"
        onClick={props.addCanvasStream}
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
          New scene
        </h4>
        <IoGrid className="maximized" style={{ maxHeight: "4em" }} />
      </button>
    </div>
  );
};

export default SceneList;
