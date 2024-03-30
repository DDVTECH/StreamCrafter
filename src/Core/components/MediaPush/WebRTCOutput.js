/*

Imports a hook which will broadcast the passed MediaStream using WebRTC + MistServer signaling

*/
import useWebRTCBroadcaster from "../../hooks/MistServerWebRTCBroadcaster";

const WebRTCOutput = (props) => {
  useWebRTCBroadcaster({
    uri: props.target,
    sourceRef: props.sourceRef,
    streamBitrate: props.streamBitrate,
  });
};

export default WebRTCOutput;
