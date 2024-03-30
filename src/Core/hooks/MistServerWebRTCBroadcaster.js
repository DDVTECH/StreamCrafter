import { useState, useEffect, useRef } from "react";
import useSignaling from "./MistServerWebRTCSignaling";

/*
  WebRTC pushing

  @param props (object)
  - uri (string):               WSS URL
  - streamBitrate (function):   desired bitrate of shown video track
  - stream (object):            reference to a MediaStream we want to export
 */
const useWebRTCBroadcaster = (props) => {
  // Reference to the WebRTC connections
  const peerConnRef = useRef(null);
  // Ready to send out WebRTC
  const [isReady, setReady] = useState(false);
  // Whether we are currently connected over WebRTC
  const [isStreaming, setIsStreaming] = useState(false);
  // Open websocket for signaling
  const [sendVideoBitrate, sendOfferSDP, sendStop, sendSeek] = useSignaling({
    uri: props.uri,
    onEvent: onEvent,
  });

  useEffect(() => {
    if (!isReady || !props.sourceRef) {
      return;
    }
    // If we are already streaming - noop
    if (isStreaming) {
      return;
    }
    console.log(
      "starting push to ",
      props.uri,
      "with tracks ",
      props.sourceRef.getTracks()
    );
    // Set up WebRTC connection
    peerConnRef.current = new RTCPeerConnection();
    peerConnRef.current.addStream(props.sourceRef);
    const onNegotiation = (event) => {
      peerConnRef.current
        .createOffer({ offerToReceiveVideo: false, offerToReceiveAudio: false })
        .then(
          function (offer) {
            let localOfferSDP = offer.sdp;
            peerConnRef.current.setLocalDescription(offer).then(
              function () {
                sendVideoBitrate(props.streamBitrate);
                sendOfferSDP(localOfferSDP);
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
    };
    peerConnRef.current.addEventListener("negotiationneeded", onNegotiation);
  }, [isReady]);

  // FUNCTIONS WEBRTC SIGNALING

  function onSignalingDisconnected() {
    setReady(false);
    setIsStreaming(false);
  }

  function onSignalingConnected() {
    setReady(true);
  }

  function onBitrateUpdate(ev) {
    if (ev.video_bitrate_constraint < props.streamBitrate) {
      console.log(
        "Video bitrate reduced to " +
          ev.video_bitrate_constraint +
          " requesting it to be increased to " +
          props.streamBitrate
      );
      sendVideoBitrate(props.streamBitrate);
    }
  }

  function onSignalingError(ev) {
    console.error(ev.message);
  }

  function onSignalingAnswerSuccess() {
    setIsStreaming(true);
  }

  function onSignalingAnswerError(error) {
    console.error("Failed to set the remote answer.", error);
  }

  function onSignalingSdp(ev) {
    if (!ev.result) {
      console.error("The media server rejected the stream");
      onSignalingDisconnected();
      return;
    }

    var opts = { type: "answer", sdp: ev.answer_sdp };
    var answer = new RTCSessionDescription(opts);
    peerConnRef.current
      .setRemoteDescription(answer)
      .then(onSignalingAnswerSuccess, onSignalingAnswerError);
  }

  function onEvent(ev) {
    switch (ev.type) {
      case "on_connected": {
        onSignalingConnected();
        break;
      }
      case "on_message": {
        break;
      }
      case "on_disconnected": {
        onSignalingDisconnected();
        break;
      }
      case "on_answer_sdp": {
        onSignalingSdp(ev);
        break;
      }
      case "on_error": {
        onSignalingError(ev);
        break;
      }
      case "on_video_bitrate": {
        onBitrateUpdate(ev);
        break;
      }
      case "on_media_receive": {
        break;
      }
      case "on_track_drop": {
        let addThisTrack = null;
        if (ev.mediatype == "video") {
          console.log("Dropped video track...");
          const trks = props.sourceRef.getVideoTracks();
          console.log("Replacing track with: ", trks);
          if (trks.length) {
            addThisTrack = trks[0];
          }
        }
        if (ev.mediatype == "audio") {
          console.log("Dropped audio track...");
          const trks = props.sourceRef.getAudioTracks();
          console.log("Replacing track with: ", trks);
          if (trks.length) {
            addThisTrack = trks[0];
          }
        }
        if (addThisTrack) {
          console.log("Re-adding track: ", addThisTrack);
          peerConnRef.current.addTrack(addThisTrack);
        }
        break;
      }
      default: {
        console.warn("Unhandled event:", ev.type, ev);
        break;
      }
    }
  }
};

export default useWebRTCBroadcaster;
