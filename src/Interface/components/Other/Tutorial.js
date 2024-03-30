/*

*/
import React from 'react';
import { IoHelpCircle, IoAddCircle, IoVideocamOff } from "react-icons/io5";

const Tutorial = () => {
  return (
    <ul style={{ minWidth: "50vw", maxHeight: "80vh", overflowY: "auto" }}>
      <h3>StreamCrafter</h3>
      <p>
        The StreamCrafter allows you to broadcast cameras, browser tabs,
        monitors and audio devices. Multiple sources can be combined in a scene
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
        <p>Start off by pressing this button to add a scene or asset to broadcast</p>
      </div>

      <hr className="foregroundBorderBot" />

      <h3>Active stream</h3>
      <p>
        Only one scene or video asset can be broadcasted at a time, but you can
        freely switch between active assets (even during a broadcast)
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
            <IoVideocamOff className="maximized" />
          </button>
        </div>
        <p>
          click on this button next to a scene or asset to mark it as active
        </p>
      </div>

      <hr className="foregroundBorderBot" />

      <h3>Editing scenes</h3>
      <p>
        When a scene is active, the preview window becomes interactive. You only
        need your mouse in order to modify your scene:
      </p>
      <p>- drag and drop assets to add them to the scene</p>
      <p>- drag corners or edges of a layer to resize it</p>
      <p style={{ fontWeight: "bold" }}>
        Note: when a layer is resized it will automatically fit the source inside the layer and display which parts were cropped off. You can toggle to stretch the source instead in the layer settings
      </p>
      <p>- drag a layer to move them around</p>
      <p>
        - drag with the both mouse buttons to use the snap-grid for positioning
        and resizing
      </p>
      <p>
        - right click to open a menu for layer options, like clipping or
        removing it
      </p>

      <hr className="foregroundBorderBot" />

      <h3>Hints</h3>
      <div className="column-container" style={{}}>
        <div
          className="column-container-min"
          style={{ width: "2em", marginRight: "1em" }}
        >
          <button
            className="flex-item flex-grow nopad noborder darkBg"
            style={{ backgroundColor: "transparent" }}
          >
            <IoHelpCircle className="maximized" />
          </button>
        </div>
        <p>
          You can find more hints by clicking on this button in the header bar
        </p>
      </div>
      <p style={{ fontWeight: "bold" }}>
        Click anywhere outside of this popup to close it and start crafting!
      </p>
    </ul>
  );
};

export default Tutorial;
