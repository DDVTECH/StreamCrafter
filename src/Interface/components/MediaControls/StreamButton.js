/*

Adds inputs

*/
import React from "react";
import MediaStreamPreview from "../Generic/MediaStreamPreview";
import { IoOptions, IoEye, IoEyeOff, IoTrash } from "react-icons/io5";

// Button for maximizing/minimizing this MediaStream
// Shows magnifying glass when not editable, else a pencil
const PreviewButton = (props) => {
  let text;
  if (props.isPreview) {
    text = <IoEye className="maximized" />;
  } else {
    if (props.isEditable) {
      text = <IoEyeOff className="maximized" />;
    } else {
      text = <IoEyeOff className="maximized" />;
    }
  }
  let style = "flex-item flex-grow nopad noborder";
  if (!props.lockState) {
    if (props.isPreview) {
      style += " media-button-active";
    } else {
      style += " media-button";
    }
  }

  if (props.isPreview) {
    return (
      <button
        disabled={props.lockState}
        className={style}
        style={{
          borderTopLeftRadius: "0.1em",
        }}
        onClick={props.clearPreview}
      >
        {text}
      </button>
    );
  } else {
    return (
      <button
        disabled={props.lockState}
        className={style}
        onClick={props.setCurrentSteam}
        style={{ borderTopLeftRadius: "0.1em" }}
      >
        {text}
      </button>
    );
  }
};

// Button to open a properties modal
const PropertiesButton = (props) => {
  return (
    <button
      className="media-button flex-item flex-grow nopad noborder"
      onClick={(e) => {
        props.toggleShowStreamProperties(props.thisObj, e);
      }}
    >
      <IoOptions className="maximized" />
    </button>
  );
};

// Button for removing this MediaStream
const RemoveButton = (props) => {
  return (
    <button
      className="media-button flex-item flex-grow nopad noborder redColor"
      onClick={props.removeStream}
      style={{ borderTopRightRadius: "0.1em" }}
    >
      <IoTrash className="maximized" />
    </button>
  );
};

const StreamButton = (props) => {
  const setCurrentSteam = () => {
    props.setCurrentSteam(props.streamObj);
  };

  const removeStream = () => {
    props.removeStream(props.streamObj);
  };

  let border = "backgroundBorder";
  if (props.isPreview) {
    border = "activeBorder";
    if (props.isPushing) {
      border += " pulseBorder";
    }
  } else if (props.isLayer) {
    border = "activeAltBorder";
    if (props.isPushing) {
      border += " pulseBorder";
    }
  }

  const grabAble = !props.streamObj?.isScene && (props.handleDrag || props.handleDrop) || false;

  return (
    <div
      className={"container flex-item flex-grow nopad " + border}
      style={{
        borderRadius: "0.3em",
        maxHeight: "100%",
        maxWidth: "100%",
        height: "100%",
        width: "100%",
        cursor: grabAble ? "grab" : "default",
      }}
      draggable={grabAble ? true : false}
      onDragStart={(ev) => {
        props.handleDrag && props.handleDrag(ev, props.streamObj);
      }}
    >
      <div
        className="flex-parent"
        style={{
          height: "2em",
        }}
      >
        <PreviewButton
          isPreview={props.isPreview}
          isEditable={props.streamObj.isScene}
          setCurrentSteam={setCurrentSteam}
          clearPreview={props.clearPreview}
        />
        <PropertiesButton
          toggleShowStreamProperties={props.toggleShowStreamProperties}
          thisObj={props.streamObj}
        />
        <RemoveButton removeStream={removeStream} />
      </div>
      <div
        className="flex-parent darkFg backgroundBorderTop backgroundBorderBot"
        style={{
          justifyContent: "center",
        }}
      >
        <h4 className="nopad">{props.streamObj.properties.name}</h4>
      </div>
      <div
        className="flex-parent"
        onTouchStart={(ev) => {
          props.handleDrag && props.handleDrag(ev, props.streamObj);
        }}
        onTouchEnd={(ev) => {
          if (props.isLayer || !props.handleDrop) {
            return;
          }
          props.handleDrop(ev, "addToCanvas");
        }}
      >
        <MediaStreamPreview
          stream={props.streamObj.mediaStreamRef.current}
          source={props.streamObj.mediaDOMRef.current}
          roundedBottoms={true}
          styleOverride={{ width: "100%", objectFit: "contain", aspectRatio: 16/9 }}
        />
      </div>
    </div>
  );
};

export default StreamButton;
