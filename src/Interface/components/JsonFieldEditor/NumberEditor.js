/*



*/

import React from 'react';
const NumberEditor = (props) => {
  let disable = false;
  if (
    props.currentValue == props.maxValue &&
    props.currentValue == props.minValue
  ) {
    disable = true;
  }
  return (
    <div className={"container flex-item flex-grow nopad"}>
      <div className="flex-parent">
        <p className="flex-item nopad noborder">{props.minValue}</p>
        <input
          type="number"
          value={props.currentValue}
          placeholder={props.placeholder}
          onChange={props.updateValue}
          max={props.maxValue}
          min={props.minValue}
          className="flex-item flex-grow nopad noborder"
          disabled={disable}
        />
        <p className="flex-item nopad noborder">{props.maxValue}</p>
      </div>
    </div>
  );
};

export default NumberEditor;
