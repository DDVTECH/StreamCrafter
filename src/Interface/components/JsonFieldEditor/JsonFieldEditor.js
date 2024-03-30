/*



*/
import React from 'react';
import { useState, useEffect } from "react";
import TextEditor from "./TextEditor";
import BooleanEditor from "./BooleanEditor";
import ColorEditor from "./ColorEditor";
import SliderEditor from "./SliderEditor";
import NumberEditor from "./NumberEditor";
import RadioSelector from "./RadioSelector";
import DropdownSelector from "./DropdownSelector";
import ApplyButton from "./ApplyButton";
// import "../style.css";

const isColor = (strColor) => {
  const s = new Option().style;
  s.color = strColor;
  if (s.color == "canvas" || s.color == "") {
    return false;
  }
  return true;
};

const JsonFieldEditor = (props) => {
  const [currentValue, setValue] = useState(props.thisProperties[props.name]);
  const isModified = currentValue != props.thisProperties[props.name];
  let minValue = null;
  if (props.minValue != null) {
    minValue = Math.floor(props.minValue);
  }
  let maxValue = null;
  if (props.maxValue != null) {
    maxValue = Math.floor(props.maxValue);
  }
  const updateValue = (event) => {
    setValue(event.target.value);
  };
  const applyVal = () => {
    if (isModified) {
      let newProperties = JSON.parse(JSON.stringify(props.thisProperties));
      const type = typeof newProperties[props.name];
      if (type == "number") {
        newProperties[props.name] = parseFloat(currentValue);
      } else if (type == "boolean") {
        newProperties[props.name] = currentValue;
      } else {
        newProperties[props.name] = currentValue.toString();
      }
      props.setNewProperties(newProperties);
    }
  };
  const clearVal = () => {
    setValue(props.thisProperties[props.name]);
  };

  useEffect(() => {
    if (props.thisProperties[props.name] != currentValue) {
      setValue(props.thisProperties[props.name]);
    }
  }, [props.thisProperties[props.name]]);

  useEffect(() => {
    if (!props.autoApply || !maxValue) {
      return;
    }
    if (currentValue > maxValue) {
      setValue(maxValue);
    }
    if (currentValue < minValue) {
      setValue(minValue);
    }
    applyVal();
  }, [maxValue, minValue]);

  useEffect(() => {
    if (!props.autoApply) {
      return;
    }
    applyVal();
  }, [currentValue, props.autoApply]);

  let editorComponent = null;
  const forceType = props.forceType || "";
  const thisType = typeof props.thisProperties[props.name];
  if (forceType == "slider") {
    editorComponent = (
      <SliderEditor
        currentValue={currentValue}
        placeholder={props.thisProperties[props.name]}
        updateValue={updateValue}
        minValue={minValue}
        maxValue={maxValue}
        hideValue={props.hideValue}
        forceValue={props.forceValue}
      />
    );
  } else if (thisType == "number") {
    editorComponent = (
      <NumberEditor
        currentValue={currentValue}
        placeholder={props.thisProperties[props.name]}
        updateValue={updateValue}
        minValue={minValue}
        maxValue={maxValue}
      />
    );
  } else if (thisType == "string") {
    if (isColor(props.thisProperties[props.name])) {
      editorComponent = (
        <ColorEditor
          currentValue={currentValue}
          placeholder={props.thisProperties[props.name]}
          updateValue={updateValue}
        />
      );
    }
    editorComponent = (
      <TextEditor
        currentValue={currentValue}
        placeholder={props.thisProperties[props.name]}
        updateValue={updateValue}
      />
    );
  } else if (thisType == "boolean") {
    editorComponent = (
      <BooleanEditor
        setValue={setValue}
        currentValue={currentValue}
        forceValue={props.forceValue}
        icon={props.icon}
      />
    );
  } else if (thisType == "dropdown") {
    editorComponent = (
      <DropdownSelector
        values={props.values}
        setValue={setValue}
        currentValue={currentValue}
      />
    );
  } else if (thisType == "radio") {
    editorComponent = (
      <RadioSelector
        values={props.values}
        setValue={setValue}
        currentValue={currentValue}
      />
    );
  }
  return (
    <div
      className="column-container"
      style={{
        textAlign: "center",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <div className={"container flex-item flex-grow"}>
        <div
          className="flex-parent"
          style={{
            marginBottom: "0.2em",
          }}
        >
          {props.tooltip ? (
            <div className="tooltip">
              <h4 className="nopad">{props.title}</h4>
              <span className="tooltiptext">{props.tooltip}</span>
            </div>
          ) : (
            <h4 className="nopad">{props.title}</h4>
          )}
        </div>
        {editorComponent}
      </div>
      <ApplyButton
        action={applyVal}
        isModified={isModified}
        autoApply={props.autoApply}
      />
    </div>
  );
};

export default JsonFieldEditor;
