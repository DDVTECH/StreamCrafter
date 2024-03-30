/*



*/

import React from 'react';
const ColorEditor = (props) => {
  return (
    <input
      type="color"
      value={props.currentValue}
      placeholder={props.placeholder}
      onChange={props.updateValue}
      className="flex-item flex-grow"
      style={{
        textAlign: "center",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        width: "3em",
        height: "3em",
      }}
    />
  );
};

export default ColorEditor;
