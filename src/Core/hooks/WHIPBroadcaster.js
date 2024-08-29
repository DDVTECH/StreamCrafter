import { useState, useEffect, useRef } from "react";

/*
  WebRTC WHIP pushing

  @param props (object)
  - uri (string):               HTTPS WHIP compatible ingest URL
  - stream (object):            reference to a MediaStream we want to export
 */
const useWHIPBroadcaster = (props) => {
  // Reference to the WebRTC connections
  const peerConnRef = useRef(null);
  // Whether we are currently connected over WebRTC
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!props.sourceRef || isStreaming) {
      return;
    }
    console.log(
      "starting push to ",
      props.uri,
      "with tracks ",
      props.sourceRef.getTracks(),
    );
    // Set up WebRTC connection
    peerConnRef.current = new RTCPeerConnection();
    peerConnRef.current.onconnectionstatechange = onStatusChange;
    peerConnRef.current.addStream(props.sourceRef);
    
    //set video encoder settings
    const senders = peerConnRef.current.getSenders();
    senders.forEach((sender)=>{
      if (sender.track.kind == "video") {
        const parameters = sender.getParameters();
        if (!parameters.encodings) { parameters.encodings = [{}]; }

        parameters.encodings[0].maxBitrate = 20 * 1024 * 1024;
        parameters.encodings[0].maxFramerate = 60;
        parameters.encodings[0].adaptivePtime = true; //adaptive packet rate

        sender.setParameters(parameters).then(() => {
          //encoding parameters changed successfuly
          /*senders.forEach((sender)=>{
            if (sender.track.kind == "video") {
              const parameters = sender.getParameters();
              console.log("encoding parameters",parameters);
            }
          });*/
        }).catch(e => console.error(e))
      }else{
        const parameters = sender.getParameters();
        if (!parameters.encodings) { parameters.encodings = [{}]; }

        parameters.encodings[0].maxBitrate = 10 * 1024 * 1024;

        sender.setParameters(parameters).then(() => {
          //encoding parameters changed successfuly
          /*senders.forEach((sender)=>{
            if (sender.track.kind == "video") {
              const parameters = sender.getParameters();
              console.log("encoding parameters",parameters);
            }
          });*/
        }).catch(e => console.error(e))
      }
    });

    peerConnRef.current
      .createOffer({ offerToReceiveVideo: false, offerToReceiveAudio: false })
      .then(
        function (offer) {
          let localOfferSDP = offer.sdp;
          console.log("set offer");
          peerConnRef.current.setLocalDescription(offer).then(
            function () {
              console.log("sending offer to " + props.uri);
              fetch(props.uri, {
                method: "POST",
                body: localOfferSDP,
                headers: {
                  "Content-Type": "application/sdp",
                },
              }).then(function (resp) {
                resp.text().then(function (answer) {
                  console.log("received answer");
                  peerConnRef.current.setRemoteDescription({
                    type: "answer",
                    sdp: answer,
                  });
                });
              });
            },
            function (err) {
              console.error("Failed to set the local offer.");
              console.error(err);
            }
          );
        },
        function (err) {
          console.error("Failed to get offer.");
          console.error(err);
        }
      );
    return () => {
      if (peerConnRef.current) {
        peerConnRef.current.close();
        peerConnRef.current = null;
      }
      setIsStreaming(false);
    };
  }, []);

  // WHIP signalling handler
  function onStatusChange(ev) {
    const status = peerConnRef.current.connectionState;
    console.log("Status of WHIP connection changed to " + status);
    switch (status) {
      case "connected":
        // The connection has become fully connected
        if (!isStreaming) {
          setIsStreaming(true);
        }
        break;
      case "disconnected":
      case "failed":
        // One or more transports has terminated unexpectedly or in an error
        setIsStreaming(false);
        break;
      case "closed":
        // The connection has been closed
        setIsStreaming(false);
        break;
      case "connecting":
        setIsStreaming(true);
        break;
    }
    return;
  }
};

export default useWHIPBroadcaster;
