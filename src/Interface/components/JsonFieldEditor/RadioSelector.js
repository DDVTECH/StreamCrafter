/*



*/
import React from 'react';
const RadioSelector = (props) => {
  return (
    <div className={"container flex-item flex-grow nopad"}>
      {props.values.map((obj, index) => {
        return (
          <div
            style={{ justifyContent: "flex-start", display: "flex" }}
            key={"radio-" + obj.value + "-" + index}
          >
            <input
              type="radio"
              name={props.title}
              value={obj.value}
              id={obj.value}
              checked={obj.value == props.currentValue}
              onChange={props.setValue}
            />
            <label htmlFor={obj.value}>{obj.title}</label>
          </div>
        );
      })}
    </div>
  );
};

export default RadioSelector;
