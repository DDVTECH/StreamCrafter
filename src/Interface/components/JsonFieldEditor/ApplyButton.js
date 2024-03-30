/*



*/
import React from 'react';
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

const ApplyButton = (props) => {
  if (props.autoApply) {
    return null;
  }
  if (props.isModified) {
    return (
      <button
        className="nopad noborder media-button-active"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          width: "2em",
          height: "2em",
          display: "flex",
          borderRadius: "0.3em",
        }}
        onClick={props.action}
      >
        <IoCheckmarkCircle className="maximized" />
      </button>
    );
  } else {
    return (
      <button
        className="nopad noborder"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          width: "2em",
          height: "2em",
          display: "flex",
          borderRadius: "0.3em",
        }}
        disabled
      >
        <IoCloseCircle className="maximized" />
      </button>
    );
  }
};

export default ApplyButton;
