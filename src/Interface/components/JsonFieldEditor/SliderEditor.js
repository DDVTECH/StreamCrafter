/*



*/
// import "./style.css";
import React from 'react';

const SliderEditor = (props) => {
  let disable = false;
  if (
    props.currentValue == props.maxValue &&
    props.currentValue == props.minValue
  ) {
    disable = true;
  }
  if (props.forceValue) {
    disable = true;
  }
  return (
    <div className={"container flex-item flex-grow nopad"}>
      {props.hideValue ? null : (
        <div className="flex-parent">
          <p className="flex-item nopad noborder">{props.minValue}</p>
          <input
            type="number"
            value={
              props.forceValue ? props.forceValue.value : props.currentValue
            }
            placeholder={props.placeholder}
            onChange={props.updateValue}
            max={props.maxValue}
            min={props.minValue}
            step={1}
            className="flex-item flex-grow nopad noborder"
            disabled={disable}
          />
          <p className="flex-item nopad noborder">{props.maxValue}</p>
        </div>
      )}
      <div className="flex-parent">
        <input
          type="range"
          value={props.forceValue ? props.forceValue.value : props.currentValue}
          placeholder={props.placeholder}
          onChange={props.updateValue}
          max={props.maxValue}
          min={props.minValue}
          step={1}
          className="flex-item flex-grow darkFg"
          disabled={disable}
        />
      </div>
    </div>
  );
};

export default SliderEditor;
