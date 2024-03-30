import { useState, useEffect, useRef } from "react";
/*

  WebRTC signaling

  @param props (object)
  - uri (string):         WSS URL
  - onEvent (function):   Callback handler to be implemented in the parent component
 */
const useSignaling = (props) => {
  const webSocket = useRef(null);

  useEffect(() => {
    if (props.uri == "") {
      return;
    }

    // If we already have a ref assigned - noop
    if (webSocket.current) {
      return;
    }

    // Connect to the given URL and set all WebSocket functions
    const connectWebSocket = () => {
      if (webSocket.current) {
        return;
      }

      console.log("Opening signaling WebSocket to '" + props.uri + "'");
      webSocket.current = new WebSocket(props.uri);

      // Signal 'on_connected' to the callback handler when the connection succeeds
      webSocket.current.onopen = () => {
        props.onEvent({ type: "on_connected" });
      };

      // Signal 'on_disconnected' to the callback handler when the connection ends
      webSocket.current.onclose = (e) => {
        console.log("signaling WebSocket was closed");
        switch (e.code) {
          default: {
            props.onEvent({ type: "on_disconnected" });
            break;
          }
        }
        // We want to retry the connection, so destruct the webSocket for now
        if (webSocket.current) {
          webSocket.current.close();
          webSocket.current = null;
        }
        // Reconnect the WS after a few seconds
        setTimeout(function () {
          console.log("Restarting websocket signalling");
          if (!webSocket.current) {
            connectWebSocket();
          }
        }, 3000);
      };
      // Signal 'on_message' followed by the message payload to the callback handler
      webSocket.current.onmessage = (e) => {
        props.onEvent({ type: "on_message" });
        try {
          var cmd = JSON.parse(e.data);
          props.onEvent(cmd);
        } catch (err) {
          console.error("Failed to parse WebSocket payload to JSON");
          console.log(e.data);
          console.error(err);
        }
      };
    };
    connectWebSocket();

    // Close WebSocket if the component is no longer rendered
    return () => {
      console.log("Destructing signaling websocket");
      if (webSocket.current) {
        webSocket.current.close();
        webSocket.current = null;
      }
    };
  }, [webSocket]);

  // Sends a given JSON cmd over the signaling WebSocket
  function send(cmd) {
    // NOTE: we probably need to do some more checks here
    if (!webSocket || webSocket.current.readyState !== WebSocket.OPEN) {
      console.log(
        "Cannot send signaling command, as the WebSocket connection is not (yet) active"
      );
      return;
    }
    webSocket.current.send(JSON.stringify(cmd));
  }

  // WebRTC signaling functions the parent component might want to call

  function sendVideoBitrate(bitrate) {
    send({ type: "video_bitrate", video_bitrate: bitrate });
  }

  function sendOfferSDP(sdp) {
    send({ type: "offer_sdp", offer_sdp: sdp });
  }

  function sendStop() {
    send({ type: "stop" });
  }

  function sendSeek(seekTime) {
    send({ type: "seek", seek_time: seekTime });
  }

  return [sendVideoBitrate, sendOfferSDP, sendStop, sendSeek];
};

export default useSignaling;
