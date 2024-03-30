/*



*/
import React from 'react';

const TextEditor = (props) => {
  return (
    <div style={{ justifyContent: "flex-end", display: "flex" }}>
      <input
        type="text"
        value={props.currentValue}
        placeholder={props.placeholder}
        onChange={props.updateValue}
        style={{ width: "100%", padding: "0.5em", marginTop: "0.2em" }}
      />
    </div>
  );
};

export default TextEditor;
