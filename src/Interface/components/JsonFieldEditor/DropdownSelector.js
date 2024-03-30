/*



*/
import React from 'react';
const DropdownSelector = (props) => {
  return (
    <div className={"container flex-item flex-grow nopad"}>
      <div style={{ justifyContent: "flex-start", display: "flex" }}>
        <select
          id={props.title}
          name={props.title}
          onChange={props.setValue}
          value={props.currentValue}
        >
          {props.values.map((obj, index) => {
            return (
              <option
                key={"dropdown-" + obj.value + "-" + index}
                value={obj.value}
              >
                {obj.title}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default DropdownSelector;
