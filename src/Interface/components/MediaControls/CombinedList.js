/*

Show available streams to broadcast and creates Broadcasts

*/
import React from 'react';
import StreamButton from "./StreamButton";

const CombinedList = (props) => {
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
  props.mediaStreams?.map((stream, i) => {
    if (!stream.hasVideo){
      return;
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
        //
        isLayer={false}
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
    </div>
  );
};

export default CombinedList;
