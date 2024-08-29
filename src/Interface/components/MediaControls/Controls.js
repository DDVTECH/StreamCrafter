/*

Switches between various modes of displaying the sources & scenes

*/
import React from "react";
import SceneList from "./SceneList";
import SourceList from "./SourceList";
import CombinedList from "./CombinedList";
import MixerPanel from "./MixerPanel";
import { IoLayers, IoVideocam, IoOptions, IoPlay, IoMic } from "react-icons/io5";

const Controls = (props) => {
  // Show different UI panels on mobile vs desktop
  const isMobile = screen.availHeight > screen.availWidth;
  if (isMobile) {
    return (
      <div style={{ display: "flex", alignItems: "stretch", height: "24em" }}>
        <div
          className="row-container noselect darkFg backgroundBorderRight"
          style={{
            flex: 2,
          }}
        >
          {props.toggleMixer ? null : (
            <div
              className="flex-parent darkFg backgroundBorderTop backgroundBorderRight"
              style={{
                justifyContent: "center",
                width: "8em",
              }}
            >
              <h4 className="nopad">Sources</h4>
            </div>
          )}
          {props.toggleMixer ? (
            <MixerPanel
              mediaSources={props.mediaStreams}
              currentStream={props.currentStream}
              mutateMediaStream={props.mutateMediaStream}
              audioState={props.audioState}
              removeStream={props.removeStream}
            />
          ) : (
            <CombinedList
              // All media streams we want to render a preview for
              mediaStreams={props.mediaStreams}
              scenes={props.scenes}
              // Used to show which scene is currently maximized
              currentStream={props.currentStream}
              // Setters for the state
              removeStream={props.removeStream}
              clearPreview={props.clearPreview}
              setCurrentSteam={props.setCurrentSteam}
              toggleShowStreamProperties={props.toggleShowStreamProperties}
              //
              isPushing={props.isPushing}
            />
          )}

          <div
            className="flex-parent darkFg backgroundBorderRight"
            style={{
              justifyContent: "center",
              width: "100vw",
            }}
          >
            <button
              className="row-container action-button nopad noborder"
              onClick={props.arrangeScene}
              style={{
                height: "calc(8em - 1em)",
                maxHeight: "calc(8em - 1em)",
                alignItems: "center",
                justifyContent: "space-between",
                width: "unset",
                padding: "1em",
                borderRadius: "0.3em",
                margin: "1em",
              }}
            >
              <h4 className="maximized nopad" style={{ flex: 1 }}>
                Arrange
              </h4>
              <IoLayers className="maximized" style={{ maxHeight: "4em" }} />
            </button>
            <button
              className="row-container action-button nopad noborder"
              onClick={props.toggleShowAddSource}
              style={{
                height: "calc(8em - 1em)",
                maxHeight: "calc(8em - 1em)",
                alignItems: "center",
                justifyContent: "space-between",
                width: "unset",
                padding: "1em",
                borderRadius: "0.3em",
                margin: "1em",
              }}
            >
              <h4 className="maximized nopad" style={{ flex: 1 }}>
                Connect
              </h4>

              {props.toggleMixer ? (
                <IoMic
                  className="maximized"
                  style={{ maxHeight: "4em" }}
                />
              ) : (
                <IoVideocam
                  className="maximized"
                  style={{ maxHeight: "4em" }}
                />
              )}
            </button>

            {props.toggleMixer ? (
              <button
                className="row-container action-button nopad noborder"
                disabled={!props.toggleMixer}
                onClick={() => props.setToggleMixer(!props.toggleMixer)}
                style={{
                  height: "calc(8em - 1em)",
                  maxHeight: "calc(8em - 1em)",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "unset",
                  padding: "1em",
                  borderRadius: "0.3em",
                  margin: "1em",
                }}
              >
                <h4 className="maximized nopad" style={{ flex: 1 }}>
                  Sources
                </h4>
                <IoPlay className="maximized" style={{ maxHeight: "4em" }} />
              </button>
            ) : (
              <button
                className="row-container action-button nopad noborder"
                disabled={props.toggleMixer}
                onClick={() => props.setToggleMixer(!props.toggleMixer)}
                style={{
                  height: "calc(8em - 1em)",
                  maxHeight: "calc(8em - 1em)",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "unset",
                  padding: "1em",
                  borderRadius: "0.3em",
                  margin: "1em",
                }}
              >
                <h4 className="maximized nopad" style={{ flex: 1 }}>
                  Mixer
                </h4>
                <IoOptions className="maximized" style={{ maxHeight: "4em" }} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "stretch", height: "24em" }}>
      <div
        className="row-container noselect darkFg backgroundBorderRight"
        style={{
          flex: 2,
        }}
      >
        {/* Render list of scenes */}
        <div
          className="flex-parent darkFg backgroundBorderTop backgroundBorderRight"
          style={{
            justifyContent: "center",
            width: "8em",
          }}
        >
          <h4 className="nopad">Scenes</h4>
        </div>
        <SceneList
          scenes={props.scenes}
          // Used to show which scene is currently maximized
          currentStream={props.currentStream}
          // Setters for the state
          removeStream={props.removeStream}
          clearPreview={props.clearPreview}
          setCurrentSteam={props.setCurrentSteam}
          toggleShowStreamProperties={props.toggleShowStreamProperties}
          //
          isPushing={props.isPushing}
          addCanvasStream={props.addCanvasStream}
          arrangeScene={props.arrangeScene}
        />
        {/* Render list of sources */}
        <div
          className="flex-parent darkFg backgroundBorderRight"
          style={{
            justifyContent: "center",
            width: "8em",
          }}
        >
          <h4 className="nopad">Sources</h4>
        </div>
        <SourceList
          // Used to show which MediaButton is currently maximized
          currentStream={props.currentStream}
          // All media streams we want to render a preview for
          mediaStreams={props.mediaStreams}
          // Setters for the state
          removeStream={props.removeStream}
          clearPreview={props.clearPreview}
          startBroadcast={props.startBroadcast}
          setCurrentSteam={props.setCurrentSteam}
          toggleShowStreamProperties={props.toggleShowStreamProperties}
          // Handle dragging/dropping buttons onto the canvas
          handleDrag={props.handleDrag}
          handleDrop={props.handleDrop}
          //
          isPushing={props.isPushing}
          toggleShowAddSource={props.toggleShowAddSource}
        />
      </div>
      {/* Audio Mixer */}
      <MixerPanel
        mediaSources={props.mediaStreams}
        currentStream={props.currentStream}
        mutateMediaStream={props.mutateMediaStream}
        audioState={props.audioState}
        removeStream={props.removeStream}
      />
    </div>
  );
};

export default Controls;
