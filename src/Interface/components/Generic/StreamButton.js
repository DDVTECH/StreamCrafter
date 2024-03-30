/*



*/
import React from 'react';
import { IoVideocam, IoVideocamOff } from "react-icons/io5";

const StartStreaming = (props) => {
  const handleClick = () => {
    props.startBroadcast(props.properties);
  };

  return (
    <button
      className="column-container action-button noborder"
      style={{
        height: "100%",
        textAlign: "center",
        alignContent: "center",
        alignItems: "center",
      }}
      onClick={handleClick}
    >
      <h2 className="flex-item nopad noborder" style={{ marginRight: "0.2em" }}>
        Start
      </h2>
      <div
        className="flex-item nopad noborder"
        style={{ height: "100%", aspectRatio: "1" }}
      >
        <IoVideocamOff className="maximized" />
      </div>
    </button>
  );
};

const StopStreaming = (props) => {
  const handleClick = () => {
    props.removeAllBroadcasts();
  };

  return (
    <button
      className="column-container action-button noborder"
      style={{
        height: "100%",
        textAlign: "center",
        alignContent: "center",
        alignItems: "center",
      }}
      onClick={handleClick}
    >
      <h2 className="flex-item nopad noborder" style={{ marginRight: "0.2em" }}>
        Stop
      </h2>
      <div
        className="flex-item noborder"
        style={{ height: "100%", aspectRatio: "1" }}
      >
        <IoVideocam className={"maximized pulseIcon"} />
      </div>
    </button>
  );
};

const StreamButton = (props) => {
  if (props.activePushes.length) {
    return <StopStreaming removeAllBroadcasts={props.removeAllBroadcasts} />;
  }
  return (
    <StartStreaming
      properties={props.properties}
      startBroadcast={props.startBroadcast}
    />
  );
};

export default StreamButton;
