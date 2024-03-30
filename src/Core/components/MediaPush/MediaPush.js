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
  // Determine transport method
  let protocolWS = "wss://";
  let protocolHTTP = "https://";
  let host = properties.mistHost;
  let path = properties.mistPath;
  if (
    properties.mistHost == "localhost" ||
    properties.mistHost == "127.0.0.1"
  ) {
    protocolWS = "ws://";
    protocolHTTP = "http://";
    host += ":8080";
    path = "";
  }

  // WHIP or MistServer signaling?
  if (properties.preferredType == "webrtc") {
    // Any WHIP compatible endpoint
    if (properties.preferWhip) {
      return (
        <WHIPOutput
          target={properties.whipIngest}
          sourceRef={props.broadcastObj.sourceRef?.current}
        />
      );
    }
    // Else use MistServer signaling
    return (
      <WebRTCOutput
        target={protocolWS + host + path + "/webrtc/" + properties.streamName}
        streamBitrate={10000000}
        sourceRef={props.broadcastObj.sourceRef?.current}
      />
    );
  } else if (properties.preferredType == "webm") {
    return (
      <MediaRecorderOutput
        target={protocolHTTP + host + path + "/webm/" + properties.streamName}
        mimeType={
          "video/webm;codecs=" +
          props.preferredVideo +
          "," +
          props.preferredAudio
        }
        sourceRef={props.broadcastObj.sourceRef?.current}
      />
    );
  } else if (properties.preferredType == "mp4") {
    return (
      <MediaRecorderOutput
        target={protocolHTTP + host + path + "/mp4/" + properties.streamName}
        mimeType={
          "video/mp4;codecs=" +
          props.preferredVideo +
          "," +
          props.preferredAudio
        }
        sourceRef={props.broadcastObj.sourceRef?.current}
      />
    );
  }
};

export default MediaPush;
