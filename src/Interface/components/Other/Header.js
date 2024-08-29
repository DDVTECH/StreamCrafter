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
      <div className="column-container-min" style={{ height: "100%", display: "flex", flexDirection:"row" }}>
        <StreamButton
          startBroadcast={props.startBroadcast}
          removeAllBroadcasts={props.removeAllBroadcasts}
          properties={props.broadcastCanvas.properties}
          activePushes={props.activePushes}
        />
      </div>
    </div>
  );
};

export default Header;
