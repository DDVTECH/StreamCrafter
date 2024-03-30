/*

*/
import React from 'react';
import { IoAddCircle, IoSettings, IoVideocam, IoVideocamOff } from "react-icons/io5";

const Hints = () => {
  return (
    <ul style={{ minWidth: "50vw", maxHeight: "80vh", overflowY: "auto" }}>
      <h3>Adding Scenes and Sources</h3>
      <p>
        Scenes allow you to composite multiple video tracks and broadcast the
        result
      </p>
      <p>
        Sources are raw inputs, like a camera feed, screenshare, image or text
        overlay
      </p>
      <div className="column-container" style={{}}>
        <div
          className="column-container-min"
          style={{ width: "2em", marginRight: "1em" }}
        >
          <button
            className="flex-item flex-grow nopad noborder darkBg"
            style={{ backgroundColor: "transparent" }}
          >
            <IoAddCircle className="maximized" />
          </button>
        </div>
        <p>this button lets you add a scene, video or audio asset</p>
      </div>
      <hr className="foregroundBorderBot" />

      <h3>Selecting a stream to broadcast</h3>
      <p>
        Available sources are visible at the bottom of the page. Scenes are in
        separate bar on the left.
      </p>
      <div className="column-container" style={{}}>
        <div
          className="column-container-min"
          style={{ width: "2em", marginRight: "1em" }}
        >
          <button
            className="flex-item flex-grow nopad noborder activeColor"
            style={{ backgroundColor: "transparent" }}
          >
            <IoVideocam className="maximized" />
          </button>
        </div>
        <p>
          The current visible stream has this icon, together with a blue
          outline. All sources visible in the current scene get a green outline
        </p>
      </div>
      <div className="column-container" style={{}}>
        <div
          className="column-container-min"
          style={{ width: "2em", marginRight: "1em" }}
        >
          <button
            className="flex-item flex-grow nopad noborder darkBg"
            style={{ backgroundColor: "transparent" }}
          >
            <IoVideocamOff className="maximized" />
          </button>
        </div>
        <p>this icon indicates that this stream is hidden from view</p>
      </div>
      <hr className="foregroundBorderBot" />

      <h3>Modifying Scenes</h3>
      <p>
        When viewing a scene, the preview window becomes an interactive canvas
      </p>
      <p>
        You can add layers to the scene by dragging a stream from the bottom on
        top of the preview
      </p>
      <p>Drag corners or edges of a layer to resize it</p>
      <p style={{ fontWeight: "bold" }}>
        Note: when a layer is resized it will automatically fit the source
        inside the layer and display which parts were cropped off. You can
        toggle to stretch the source instead in the layer settings
      </p>
      <p>Drag a layer to move it around</p>
      <p>Right clicking on a layer opens a menu with more detailed settings</p>
      <hr className="foregroundBorderBot" />

      <h3>Snap-grid</h3>
      <p>
        When dragging a layer around, holding down both mouse buttons enables
        snap-grid mode
      </p>
      <p>
        Keep holding both mouse button to move the layer around the snap-grid.
        Release either mouse button to switch to resize mode
      </p>
      <hr className="foregroundBorderBot" />

      <h3>Broadcasting</h3>
      <p>
        You can connect the StreamCrafter with any WHIP compatible ingest server
        or self-hosted MistServer instance
      </p>
      <div className="column-container" style={{}}>
        <div
          className="column-container-min"
          style={{ width: "2em", marginRight: "1em" }}
        >
          <button
            className="flex-item flex-grow nopad noborder darkBg"
            style={{ backgroundColor: "transparent" }}
          >
            <IoSettings className="maximized" />
          </button>
        </div>
        <p>This button opens the broadcast config menu</p>
      </div>
      <p style={{ fontWeight: "bold" }}>
        Note: The StreamCrafter needs to remain focused during a broadcast
      </p>
      <p>
        Browsers will pause scene rendering when switching to another tab. In
        order to ensure continuous playback to your viewers it's advised to keep
        the StreamCrafter open in a separate window
      </p>
      <p>
        You can also try out the experimental web worker mode, which renders scene animations in a web worker. This is an experimental addition, but should allow the StreamCrafter to keep working unfocused
      </p>
    </ul>
  );
};

export default Hints;
