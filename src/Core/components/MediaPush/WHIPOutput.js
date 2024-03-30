/*

Imports a hook which will broadcast the passed MediaStream to a given WHIP compatible endpoint

*/
import useWHIPBroadcaster from "../../hooks/WHIPBroadcaster";

const WHIPOutput = (props) => {
  useWHIPBroadcaster({
    uri: props.target,
    sourceRef: props.sourceRef,
    streamBitrate: props.streamBitrate,
  });
};

export default WHIPOutput;
