/*

Adds inputs

*/
import React from 'react';
import {
  IoOptions,
  IoRadioButtonOff,
  IoRadioButtonOn,
  IoTrash,
  IoArrowDown,
  IoArrowUp,
} from "react-icons/io5";

// Button for maximizing/minimizing this MediaStream
// Shows magnifying glass when not editable, else a pencil
const SelectButton = (props) => {
  if (props.isSelected) {
    return (
      <button
        className="media-button flex-item flex-grow nopad noborder"
        onClick={(e) => {
          props.setSelectedLayer(null);
        }}
      >
        <IoRadioButtonOn className="maximized" />
      </button>
    );
  }
  return (
    <button
      className="media-button flex-item flex-grow nopad noborder"
      onClick={(e) => {
        props.setSelectedLayer(props.layerInfo);
      }}
    >
      <IoRadioButtonOff className="maximized" />
    </button>
  );
};

// Button to open a properties modal
const PropertiesButton = (props) => {
  return (
    <button
      className="media-button flex-item flex-grow nopad noborder"
      onClick={(e) => {
        props.selectLayer(props.index, e);
      }}
    >
      <IoOptions className="maximized" />
    </button>
  );
};

const UpButton = (props) => {
  if (props.currentStream?.properties?.autoSort) {
    return null;
  }
  return (
    <button
      className={props.style}
      onClick={(e) => {
        props.switchLayerPositions(props.index + 1, props.index);
      }}
      disabled={props.disabled}
    >
      <IoArrowUp className="maximized" />
    </button>
  );
};

const DownButton = (props) => {
  if (props.currentStream?.properties?.autoSort) {
    return null;
  }
  return (
    <button
      className={props.style}
      onClick={(e) => {
        props.switchLayerPositions(props.index - 1, props.index);
      }}
      disabled={props.disabled}
    >
      <IoArrowDown className="maximized" />
    </button>
  );
};

const LayerButton = (props) => {
  let border = "backgroundBorder";
  if (props.isSelected) {
    border = "activeAltBorder";
  }
  let upDisabled = props.index + 1 >= props.currentStream.layers.length;
  let upStyle = "flex-item flex-grow nopad noborder ";
  if (upDisabled) {
    upStyle += " media-button-disabled";
  } else {
    upStyle += " media-button";
  }
  let downDisabled = props.index <= 0;
  let downStyle = "flex-item flex-grow nopad noborder ";
  if (downDisabled) {
    downStyle += " media-button-disabled";
  } else {
    downStyle += " media-button";
  }
  return (
    <div
      className={"container flex-item flex-grow nopad " + border}
      style={{
        borderRadius: "0.3em",
        maxHeight: "100%",
      }}
    >
      <div
        className="flex-parent darkFg backgroundBorderBot"
        style={{
          justifyContent: "center",
        }}
      >
        <h5 className="nopad">{props.title}</h5>
      </div>
      <div
        className="flex-parent"
        style={{
          height: "2em",
        }}
      >
        <UpButton
          currentStream={props.currentStream}
          style={upStyle}
          switchLayerPositions={props.switchLayerPositions}
          index={props.index}
          disabled={upDisabled}
        />
        <DownButton
          currentStream={props.currentStream}
          style={downStyle}
          switchLayerPositions={props.switchLayerPositions}
          index={props.index}
          disabled={downDisabled}
        />
        <PropertiesButton
          selectLayer={props.selectLayerAndConfig}
          index={props.index}
        />
        <SelectButton
          setSelectedLayer={props.setSelectedLayer}
          layerInfo={props.layerInfo}
          isSelected={props.isSelected}
        />
      </div>
    </div>
  );
};

export default LayerButton;
