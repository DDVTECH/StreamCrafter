/*



*/
import React from 'react';
import JsonFieldEditor from "../JsonFieldEditor/JsonFieldEditor";
import RadioSelector from "../JsonFieldEditor/RadioSelector";
import { IoTrash, IoCrop } from "react-icons/io5";

const LayerProperties = (props) => {
  // Prevent crashes when switching from an editable to non-editable stream
  // as the non-editable stream has no layers defined at all
  if (!props.currentStream || !props.currentStream.layers) {
    return;
  }

  const thisLayer = props.selectedLayer;

  if (!thisLayer) {
    return;
  }

  const thisProperties = thisLayer.properties;

  const setNewProperties = (newProperties) => {
    let newObj = props.currentStream;
    let newLayers = props.currentStream.layers;

    for (var idx = 0; idx < newLayers.length; idx++) {
      if (thisLayer.id == newLayers[idx].id) {
        newLayers[idx].properties = newProperties;
        break;
      }
    }
    newObj.layers = newLayers;

    props.mutateMediaStream(newObj);
  };

  const removeLayer = () => {
    let newObj = props.currentStream;
    let newLayers = newObj.layers;
    for (var idx = 0; idx < newLayers.length; idx++) {
      if (thisLayer.id == newLayers[idx].id) {
        newLayers.splice(idx, 1);
        break;
      }
    }
    newObj.layers = newLayers;
    props.mutateMediaStream(newObj);
    props.closeModals();
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
        if (key == "x") {
          forceType = "slider";
          minValue = 0;
          maxValue = Math.max(
            0,
            props.broadcastCanvas.properties.width - thisProperties.width
          );
        }
        if (key == "y") {
          forceType = "slider";
          minValue = 0;
          maxValue = Math.max(
            0,
            props.broadcastCanvas.properties.height - thisProperties.height
          );
        }
        if (key == "opacity") {
          forceType = "slider";
          minValue = 0;
          maxValue = 100;
        }
        if (key == "width") {
          forceType = "slider";
          minValue = 10;
          maxValue = Math.max(0, props.broadcastCanvas.properties.width);
        }
        if (key == "height") {
          forceType = "slider";
          minValue = 10;
          maxValue = Math.max(0, props.broadcastCanvas.properties.height);
        }
        if (key == "ratio") {
          forceType = "number";
        }
        if (key == "autoFit") {
          return (
            <div
              className="flex-item flex-grow nopad"
              key={"edit-layer-" + key + "-" + index}
            >
              <div
                className="column-container"
                style={{
                  textAlign: "center",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className={"container flex-item flex-grow"}>
                  <div className="flex-parent">
                    <h4 className="nopad">Layer fit mode</h4>
                  </div>
                  <RadioSelector
                    title={"Layer fit mode"}
                    values={[
                      { title: "Center zoom source", value: "zoom" },
                      { title: "Stretch source", value: "stretch" },
                    ]}
                    setValue={(e) => {
                      const value = e.target.value;
                      thisProperties.autoFit = value == "zoom";
                      setNewProperties(thisProperties);
                    }}
                    currentValue={
                      thisProperties.autoFit
                        ? "zoom"
                        : "stretch"
                    }
                  />
                </div>
              </div>
            </div>
          );
        }
        // if (forceType == "slider"){
        //   autoApply = false;
        // }
        return (
          <div
            className="flex-item flex-grow nopad"
            key={"edit-layer-" + key + "-" + index}
          >
            <JsonFieldEditor
              name={key}
              title={title}
              thisProperties={thisProperties}
              setNewProperties={setNewProperties}
              minValue={minValue}
              maxValue={maxValue}
              forceType={forceType}
              autoApply={autoApply}
            />
          </div>
        );
      })}
      <hr
        className="foregroundBorderBot"
        style={{
          width: "calc(100%)",
          borderRadius: "0.5em",
          borderWidth: "1px",
        }}
      />
      <div
        className="column-container flex-item flex-grow nopad noborder"
        style={{
          alignItems: "center",
          marginTop: "1em",
        }}
      >
        <button
          className="column-container action-button flex-item flex-grow nopad noborder"
          onClick={props.toggleLayerClipping}
          style={{
            alignItems: "center",
            maxHeight: "4em",
            height: "4em",
            borderRadius: "0.1em",
          }}
        >
          <div
            className="flex-item flex-grow nopad noborder"
            style={{ alignContent: "center" }}
          >
            <h4>Crop Layer</h4>
          </div>
          <div
            className="flex-item flex-grow nopad noborder activeColor"
            style={{ height: "4em" }}
          >
            <IoCrop className="maximized" />
          </div>
        </button>
        <button
          className="column-container action-button flex-item flex-grow nopad noborder"
          onClick={removeLayer}
          style={{
            alignItems: "center",
            maxHeight: "4em",
            height: "4em",
            borderRadius: "0.1em",
          }}
        >
          <div
            className="flex-item flex-grow nopad noborder"
            style={{ alignContent: "center" }}
          >
            <h4>Remove Layer</h4>
          </div>
          <div
            className="flex-item flex-grow nopad noborder redColor"
            style={{ height: "4em" }}
          >
            <IoTrash className="maximized" />
          </div>
        </button>
      </div>
    </ul>
  );
};

export default LayerProperties;
