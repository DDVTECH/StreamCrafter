/*

Advanced or Basic config menu for the StreamCrafter

*/
import React from 'react';
import JsonFieldEditor from "../JsonFieldEditor/JsonFieldEditor";
import DropdownSelector from "../JsonFieldEditor/DropdownSelector";
import RadioSelector from "../JsonFieldEditor/RadioSelector";

// What users can select in dropdown menu's
const methods = [
  { title: "WebM", value: "webm" },
  { title: "MP4", value: "mp4" },
  { title: "WebRTC", value: "webrtc" },
];
const webmVideo = [
  { title: "AV1", value: "av1" },
  { title: "VP8", value: "vp8" },
  { title: "VP9", value: "vp9" },
];
const webmAudio = [
  { title: "OPUS", value: "opus" },
  { title: "VORBIS", value: "vorbis" },
];
const mp4Video = [
  { title: "VP9", value: "vp9" },
  { title: "H264", value: "avc" },
];
const mp4Audio = [
  { title: "AAC", value: "aac" },
  { title: "FLAC", value: "flac" },
  { title: "MP3", value: "mp3" },
  { title: "OPUS", value: "opus" },
];

const SimpleMenu = (props) => {
  const toggleMethod = (e) => {
    const value = e.target.value;
    if (value == "webrtc") {
      props.broadcastCanvas.properties.preferredType = "webrtc";
      props.broadcastCanvas.properties.preferredVideo = "h264";
      props.broadcastCanvas.properties.preferredAudio = "opus";
    } else {
      props.broadcastCanvas.properties.preferredType = "mp4";
      props.broadcastCanvas.properties.preferredVideo = "h264";
      props.broadcastCanvas.properties.preferredAudio = "aac";
    }
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };
  const setNewProperties = (properties) => {
    props.broadcastCanvas.properties = properties;
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };

  return (
    <ul>
      {/* advanced/simple mode slider */}
      <JsonFieldEditor
        name={"advancedMode"}
        title={"Advanced options"}
        thisProperties={props.broadcastCanvas.properties}
        setNewProperties={setNewProperties}
        forceType={"boolean"}
        autoApply={true}
        hideValue={false}
      />
      {/* low latency / quality slider */}
      {/* <div
        className="column-container"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={"container flex-item flex-grow"}>
          <div className="flex-parent">
            <h4 className="nopad">Broadcast mode</h4>
          </div>
          <RadioSelector
            title={"Broadcast mode"}
            values={[
              { title: "Low Latency", value: "webrtc" },
              { title: "High Quality", value: "mp4" },
            ]}
            setValue={toggleMethod}
            currentValue={props.broadcastCanvas.properties.preferredType}
          />
        </div>
      </div> */}
    </ul>
  );
};

const AdvancedMenu = (props) => {
  const setNewProperties = (properties) => {
    props.broadcastCanvas.properties = properties;
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };
  const setNewWithReset = (properties) => {
    props.broadcastCanvas.properties = properties;
    props.mutateBroadcastCanvas(props.broadcastCanvas, true);
  };
  const toggleWebRTCIngest = (e) => {
    const value = e.target.value;
    if (value == "whip") {
      props.broadcastCanvas.properties.preferWhip = true;
    } else {
      props.broadcastCanvas.properties.preferWhip = false;
    }
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };
  const toggleMethod = (e) => {
    const value = e.target.value;
    props.broadcastCanvas.properties.preferredType = value;
    if (value == "webrtc") {
      props.broadcastCanvas.properties.preferredVideo = "h264";
      props.broadcastCanvas.properties.preferredAudio = "opus";
    } else if (value == "mp4") {
      props.broadcastCanvas.properties.preferredVideo = "h264";
      props.broadcastCanvas.properties.preferredAudio = "aac";
    } else if (value == "webm") {
      props.broadcastCanvas.properties.preferredVideo = "vp9";
      props.broadcastCanvas.properties.preferredAudio = "opus";
    }
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };
  const setAudio = (e) => {
    const value = e.target.value;
    props.broadcastCanvas.properties.preferredAudio = value;
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };
  const setVideo = (e) => {
    const value = e.target.value;
    props.broadcastCanvas.properties.preferredVideo = value;
    props.mutateBroadcastCanvas(props.broadcastCanvas, false);
  };

  // Default dropdown for WebRTC
  let videoOptions = [{ title: "H264", value: "h264" }];
  let audioOptions = [{ title: "OPUS", value: "opus" }];
  if (props.broadcastCanvas.properties.preferredType == "mp4") {
    videoOptions = mp4Video;
    audioOptions = mp4Audio;
  }
  if (props.broadcastCanvas.properties.preferredType == "webm") {
    videoOptions = webmVideo;
    audioOptions = webmAudio;
  }

  return (
    <ul>
      {/* advanced/simple mode slider */}
      <JsonFieldEditor
        name={"advancedMode"}
        title={"Advanced options"}
        thisProperties={props.broadcastCanvas.properties}
        setNewProperties={setNewProperties}
        forceType={"boolean"}
        autoApply={true}
        hideValue={false}
        disabled
      />
      {/* Toggle using a web worker for compositing */}
      <JsonFieldEditor
        name={"useWebWorker"}
        title={"Experimental web workers"}
        thisProperties={props.broadcastCanvas.properties}
        setNewProperties={setNewWithReset}
        forceType={"boolean"}
        autoApply={true}
        hideValue={false}
        tooltip={
          "Offloads compositing scenes to Web Workers. Can work in the background that way, but still under development"
        }
      />
      {/* WebRTC mode - MistServer or generic WHIP */}
      <div
        className="column-container"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={"container flex-item flex-grow"}>
          <div className="flex-parent">
            <h4 className="nopad">WebRTC mode</h4>
          </div>
          <RadioSelector
            title={"WebRTC mode"}
            values={[
              { title: "Use WHIP", value: "whip" },
              { title: "Use MistServer signaling", value: "mist" },
            ]}
            setValue={toggleWebRTCIngest}
            currentValue={
              props.broadcastCanvas.properties.preferWhip ? "whip" : "mist"
            }
          />
        </div>
      </div>

      {/* WHIP ingest URL */}
      {props.broadcastCanvas.properties.preferWhip ? (
        <JsonFieldEditor
          name={"whipIngest"}
          title={"WHIP url"}
          thisProperties={props.broadcastCanvas.properties}
          setNewProperties={setNewProperties}
          forceType={"string"}
          autoApply={true}
          hideValue={false}
        />
      ) : null}
      {/* MistServer properties */}
      {props.broadcastCanvas.properties.preferWhip ? null : (
        <JsonFieldEditor
          name={"mistHost"}
          title={"MistServer host"}
          thisProperties={props.broadcastCanvas.properties}
          setNewProperties={setNewProperties}
          forceType={"string"}
          autoApply={true}
          hideValue={false}
          tooltip={
            "Hostname or IP address of MistServer instance. Always connects over HTTPS/WSS"
          }
        />
      )}
      {props.broadcastCanvas.properties.mistHost == "localhost" ||
      props.broadcastCanvas.properties.mistHost == "127.0.0.1" ? null : (
        <JsonFieldEditor
          name={"mistPath"}
          title={"Reverse proxy path"}
          thisProperties={props.broadcastCanvas.properties}
          setNewProperties={setNewProperties}
          forceType={"string"}
          autoApply={true}
          hideValue={false}
          tooltip={
            "If going through a proxy, the path to append to reach MistServer's HTTP port"
          }
        />
      )}
      {props.broadcastCanvas.properties.preferWhip ? null : (
        <JsonFieldEditor
          name={"streamName"}
          title={"Stream name"}
          thisProperties={props.broadcastCanvas.properties}
          setNewProperties={setNewProperties}
          forceType={"string"}
          autoApply={true}
          hideValue={false}
        />
      )}
      {/* container selector */}
      {/* <div
        className="column-container"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={"container flex-item flex-grow"}>
          <div className="flex-parent">
            <h4 className="nopad">Broadcasting method/container</h4>
          </div>
          <DropdownSelector
            title={"Broadcasting method/container"}
            values={methods}
            setValue={toggleMethod}
            currentValue={props.broadcastCanvas.properties.preferredType}
          />
        </div>
      </div> */}
      {/* video codec selector - properties.preferredVideo: "h264" */}
      {/* <div
        className="column-container"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={"container flex-item flex-grow"}>
          <div className="flex-parent">
            <h4 className="nopad">Video codec</h4>
          </div>
          <DropdownSelector
            title={"Video codec"}
            values={videoOptions}
            setValue={setVideo}
            currentValue={props.broadcastCanvas.properties.preferredVideo}
          />
        </div>
      </div> */}
      {/* audio codec selector - properties.preferredAudio: "opus" */}
      {/* <div
        className="column-container"
        style={{
          textAlign: "center",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={"container flex-item flex-grow"}>
          <div className="flex-parent">
            <h4 className="nopad">Audio codec</h4>
          </div>
          <DropdownSelector
            title={"Audio codec"}
            values={audioOptions}
            setValue={setAudio}
            currentValue={props.broadcastCanvas.properties.preferredAudio}
          />
        </div>
      </div> */}
    </ul>
  );
};

const BroadcastConfig = (props) => {
  if (!props.broadcastCanvas?.properties) {
    return;
  }
  if (props.isPushing) {
    return (
      <ul>
        <h4>These settings are locked while a broadcast is active</h4>
      </ul>
    );
  }
  if (props.broadcastCanvas.properties.advancedMode) {
    return (
      <AdvancedMenu
        broadcastCanvas={props.broadcastCanvas}
        mutateBroadcastCanvas={props.mutateBroadcastCanvas}
      />
    );
  }
  return (
    <SimpleMenu
      broadcastCanvas={props.broadcastCanvas}
      mutateBroadcastCanvas={props.mutateBroadcastCanvas}
    />
  );
};

export default BroadcastConfig;
