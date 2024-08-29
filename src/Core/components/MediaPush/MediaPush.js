/*

Actual broadcasting of a MediaStream to a given file/uri

*/
import React from 'react';
import WebRTCOutput from "./WebRTCOutput";
import WHIPOutput from "./WHIPOutput";
import MediaRecorderOutput from "./MediaRecorderOutput";

const MediaPush = (props) => {
  const properties = props.broadcastObj?.properties;

  // We require a target and transport method
  if (!properties) {
    return;
  }

  // WHIP or MistServer signaling?
  if (properties.preferredType == "webrtc") {
    // Any WHIP compatible endpoint
    if (properties.preferWhip) {
      return (
        <WHIPOutput
          target={properties.ingestUri}
          sourceRef={props.broadcastObj.sourceRef?.current}
        />
      );
    }
    // Else use MistServer signaling
    return (
      <WebRTCOutput
        target={properties.ingestUri}
        streamBitrate={10000000}
        sourceRef={props.broadcastObj.sourceRef?.current}
      />
    );
  }
};

export default MediaPush;
