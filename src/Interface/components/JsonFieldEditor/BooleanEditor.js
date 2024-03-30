/*



*/

import React from 'react';
const BooleanEditor = (props) => {
  if (props.icon) {
    return (
      <div
        style={{
          height: "100%",
          aspectRatio: "1",
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "flex-start",
          display: "flex",
          minWidth: "2em",
          cursor: props.forceValue ? "default" : "pointer"
        }}
        onClick={
          props.forceValue
            ? null
            : () => {
                props.setValue(!props.currentValue);
              }
        }
      >
        {props.icon}
      </div>
    );
  } else {
    return (
      <div
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "flex-start",
          display: "flex",
        }}
      >
        <label className="switch hideInput">
          <input
            type="checkbox"
            checked={
              props.forceValue ? props.forceValue.value : props.currentValue
            }
            onChange={(ev) => {
              props.setValue(ev.target.checked);
            }}
            disabled={props.forceValue ? true : false}
          />
          <span className="slider"></span>
        </label>
      </div>
    );
  }
};

export default BooleanEditor;
