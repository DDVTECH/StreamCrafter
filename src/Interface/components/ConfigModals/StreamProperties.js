/*



*/
import React from 'react';
import JsonFieldEditor from "../JsonFieldEditor/JsonFieldEditor";

const StreamProperties = (props) => {
  if (!props.currentStream) {
    return;
  }

  const thisProperties = props.currentStream.properties;

  if (!thisProperties) {
    return;
  }

  const setNewProperties = (newObj) => {
    let newMediaStream = props.currentStream;
    newMediaStream.properties = newObj;
    props.mutateMediaStream(newMediaStream);
  };

  return (
    <ul>
      {Object.keys(thisProperties).map((key, index) => {
        // For each known property type, use different limits or subtypes
        let minValue = null;
        let maxValue = null;
        let autoApply = true;
        let forceType = "";
        let title = key;
        let tooltip = null;
        // Slider to move the image over the canvas horizontally
        if (key == "width") {
          title = "Width";
          forceType = "slider";
          minValue = 10;
          maxValue = 1920;
          if (!props.currentStream?.isScene) {
            return;
          }
        }
        if (key == "height") {
          title = "Height";
          forceType = "slider";
          minValue = 10;
          maxValue = 1080;
          if (!props.currentStream?.isScene) {
            return;
          }
        }
        if (key == "backgroundColor") {
          title = "Background colour";
          if (!props.currentStream?.isScene) {
            return;
          }
        }
        if (key == "gridColor") {
          title = "Text and grid colour";
          if (!props.currentStream?.isScene) {
            return;
          }
        }
        if (key == "volume") {
          title = "Volume";
          forceType = "slider";
          minValue = 0;
          maxValue = 100;
        }
        if (key == "muted") {
          title = "Muted";
          forceType = "boolean";
        }
        if (key == "autoSort") {
          title = "Automatic layer sorting";
          tooltip =
            "The largest layers are draw first. Smaller layers are drawn on top.";
          forceType = "boolean";
        }
        if (key == "monitorAudio") {
          return null;
        }
        if (key == "outputAudio") {
          return null;
        }
        return (
          <JsonFieldEditor
            key={
              "edit-stream-" + props.currentStream.id + "-" + key + "-" + index
            }
            name={key}
            title={title}
            thisProperties={thisProperties}
            setNewProperties={setNewProperties}
            minValue={minValue}
            maxValue={maxValue}
            forceType={forceType}
            autoApply={autoApply}
            hideValue={false}
            tooltip={tooltip}
          />
        );
      })}
    </ul>
  );
};

export default StreamProperties;
