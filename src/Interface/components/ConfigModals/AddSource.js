/*

Shows an interface for the user to add new media sources
Returns a MediaStream with a tag as string

*/
import React from 'react';
import useCapture from "../../hooks/BrowserMediaDevices";
import ContextMenu from "../Generic/ContextMenu";
import { IoVideocam, IoMic, IoTv } from "react-icons/io5";

// Controls to add new inputs
// Can also initialize a new empty editor/stream process/canvas
const AddSource = (props) => {
  let deviceList = useCapture();

  if (!deviceList) {
    return null;
  }

  return (
    <ContextMenu
      clickEvent={props.clickEvent}
      title={"Connect"}
      data={
        <ul>
          <button
            className="column-container action-button noborder"
            style={{
              height: "100%",
              textAlign: "center",
              alignContent: "center",
              alignItems: "center",
            }}
            onClick={() => {
              props.addScreenShare();
            }}
          >
            <div
              className="nopad noborder"
              style={{ height: "2em", aspectRatio: "1" }}
            >
              <IoTv className="maximized" />
            </div>
            <h4
              className="flex-item flex-grow nopad noborder"
              style={{ marginRight: "0.2em" }}
            >
              ScreenShare
            </h4>
          </button>
          {deviceList.map((elem) => {
            let disabled = false;
            // Check if already added or not
            for (const source of props.mediaSources) {
              if (
                source.audioConstraints?.deviceId == elem.deviceId ||
                source.videoConstraints?.deviceId == elem.deviceId
              ) {
                disabled = true;
                break;
              }
            }
            if (elem.label == "Default") {
              disabled = true;
            }
            if (disabled) {
              return null;
            }
            let icon = null;
            if (elem.kind == "audioinput") {
              icon = (
                <div
                  className="nopad noborder"
                  style={{ height: "2em", aspectRatio: "1" }}
                >
                  <IoMic className="maximized" />
                </div>
              );
            } else if (elem.kind == "videoinput") {
              icon = (
                <div
                  className="nopad noborder"
                  style={{ height: "2em", aspectRatio: "1" }}
                >
                  <IoVideocam className="maximized" />
                </div>
              );
            }
            return (
              <button
                key={elem.label}
                className="column-container action-button noborder"
                style={{
                  height: "100%",
                  textAlign: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  if (elem.kind == "audioinput") {
                    props.addCamera(null, elem);
                  } else if (elem.kind == "videoinput") {
                    props.addCamera(elem, null);
                  }
                }}
              >
                {icon}
                <h4
                  className="flex-item flex-grow nopad noborder"
                  style={{ marginRight: "0.2em" }}
                >
                  {elem.label}
                </h4>
              </button>
            );
          })}
        </ul>
      }
      closeModals={props.closeModals}
    />
  );
};

export default AddSource;
