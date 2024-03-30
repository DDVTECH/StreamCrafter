/*

*/
import React from 'react';
import { IoHelpCircle, IoLink, IoSettings } from "react-icons/io5";
// Start/stop streaming button
import StreamButton from "../Generic/StreamButton";
import HeaderLogo from "./logo.png";

const Header = (props) => {
  return (
    <div className={"menu darkBg backgroundBorderBot"}>
      <div className="column-container-min" style={{ alignItems: "center" }}>
        <div className="nopad" style={{ height: "2em", marginLeft: "1em" }}>
          <img
            src={HeaderLogo}
            alt="Logo"
            className="maximized noselect"
            draggable={false}
          />
        </div>
        <h3 className="nopad" style={{ marginLeft: "1em" }}>
          StreamCrafter
        </h3>
      </div>
      <div className="column-container-min" style={{ height: "100%" }}>
        <button
          className="column-container action-button noborder"
          style={{
            height: "100%",
            textAlign: "center",
            alignContent: "center",
            alignItems: "center",
          }}
          onClick={(e) => {
            navigator.clipboard.writeText(props.shareUri);
            props.setToast({
              event: e,
              message: "Copied to clipboard!",
            });
          }}
        >
          <h2
            className="flex-item nopad noborder"
            style={{ marginRight: "0.2em" }}
          >
            Share
          </h2>
          <div
            className="flex-item noborder"
            style={{ height: "100%", aspectRatio: "1" }}
          >
            <IoLink className="maximized" />
          </div>
        </button>
        <StreamButton
          startBroadcast={props.startBroadcast}
          removeAllBroadcasts={props.removeAllBroadcasts}
          properties={props.broadcastCanvas.properties}
          activePushes={props.activePushes}
        />
        <button
          className="action-button flex-item flex-grow noborder"
          onClick={props.toggleShowConfig}
          style={{ aspectRatio: "1", height: "100%" }}
        >
          <IoSettings className="maximized" />
        </button>
        <button
          className="action-button flex-item flex-grow noborder"
          onClick={props.toggleHints}
          style={{ aspectRatio: "1", height: "100%" }}
        >
          <IoHelpCircle className="maximized" />
        </button>
      </div>
    </div>
  );
};

export default Header;
