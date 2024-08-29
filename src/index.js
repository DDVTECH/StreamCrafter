/*

Main component of the StreamCrafter
Glues Core and Interface together
Contains a state for which interface elements to show
For the rest relies on the state and mutator functions from the Core

Passable properties:
  ingestUri                 : Full path to a WHIP compatible ingest server
- sceneWidth (integer)      : Width in pixels of scenes
- sceneHeight (integer)     : Height in pixels of scenes

*/
import "./index.css";
import React from "react";
import { useState, useRef, useEffect, useReducer } from "react";
// Hidden element which
import MediaPush from "./Core/components/MediaPush/MediaPush";
// Renders hidden canvas processing element
import SourceRender from "./Core/components/MediaProcess/SourceRender";
// Renders hidden compositor, for displaying the preview
import CompositeRender from "./Core/components/MediaProcess/CompositeRender";
// Renders list of scenes, sources and the mixer
import Controls from "./Interface/components/MediaControls/Controls";
// Renders list of sources in scene
import LayerList from "./Interface/components/Panels/Layers/LayerList";
// Renders broadcast interactive canvas and preview
import InteractivePreview from "./Interface/components/InteractivePreview/InteractivePreview";
import BroadcastRender from "./Core/components/MediaProcess/BroadcastRender";
// Renders a config overlay
import ConfigModals from "./Interface/components/ConfigModals/ConfigModals";
// Renders a temporary notification at mouse location
import ToastNotif from "./Interface/components/Generic/ToastNotif";
import useStreamCrafter from "./Core/hooks/State";
import Header from "./Interface/components/Other/Header";

export const StreamCrafter = (props) => {
  const [
    // Variables
    currentStream,
    activePushes,
    mediaSources,
    scenes,
    broadcastCanvas,
    audioState,
    // Functions
    setCurrentSteam,
    addMediaStream,
    addCanvasStream,
    arrangeScene,
    addLayer,
    mutateMediaStream,
    removeStream,
    startBroadcast,
    removeAllBroadcasts,
    mutateBroadcastCanvas,
    requestCamera,
    requestScreen,
    setScenes,
    setMediaStreams,
    // Worker
    workerCompositor,
    // Cookie accessor
    cookies,
  ] = useStreamCrafter(
    props.ingestUri,
    props.sceneWidth || 1280,
    props.sceneHeight || 720
  );
  // Used to force an update when editing nested states, IE when reordering layers
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  // Object we are dragging. Used to drag & drop sources onto a scene
  const dragElement = useRef();
  // For showing a context menu at the cursor location
  const lastClickEvent = useRef();
  // Display a toast notification at the mouse position
  const [currentToast, setToast] = useState(null);
  // Edit actions that can be opened over the main preview window
  const [showStreamProperties, setShowStreamProperties] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddPush, setShowAddPush] = useState(false);
  const [showLayerClipping, setShowClipping] = useState(false);
  const [showLayerConfig, setShowLayerConfig] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [toggleMixer, setToggleMixer] = useState(false);
  // Layer to hightlight in the interactive preview
  const [showConfigRestore, setShowConfigRestore] = useState(false);
  // Make sure the bouncing DVD logo appears in a random spot on every page refresh
  const [randomDelay, setDelay] = useState(
    "-" + (600 + Math.floor(Math.random() * 1800)) + "s"
  );
  const [isErr, setErr] = useState(false);

  const handleDrag = (e, obj) => {
    dragElement.current = obj;
  };

  const handleDrop = (e, action) => {
    if (!dragElement.current) {
      return;
    }
    if (!currentStream) {
      return;
    }
    if (!currentStream.isScene) {
      console.log("Can only add layers to scenes");
      return;
    }
    if (dragElement.current == currentStream) {
      console.log("Cannot add source to itself as input");
      return;
    }
    if (action != "addToCanvas") {
      return;
    }
    // Add dragged stream to canvas
    addLayer(dragElement.current);
  };

  const closeModals = () => {
    setShowStreamProperties(false);
    setShowAddAsset(false);
    setShowClipping(false);
    setShowAddPush(false);
    setShowLayerConfig(false);
    setShowConfigRestore(false);
  };

  const toggleShowStreamProperties = (streamObj, e) => {
    lastClickEvent.current = e;
    if (streamObj == currentStream) {
      setShowStreamProperties(!showStreamProperties);
    } else {
      setNewStream(streamObj);
      setShowStreamProperties(true);
    }
    setShowAddAsset(false);
    setShowClipping(false);
    setShowAddPush(false);
    setShowLayerConfig(false);
  };

  const toggleShowAddSource = (e) => {
    lastClickEvent.current = e;
    setShowAddAsset(!showAddAsset);
    setShowClipping(false);
    setShowStreamProperties(false);
    setShowAddPush(false);
    setShowLayerConfig(false);
  };

  const toggleLayerClipping = (e) => {
    lastClickEvent.current = e;
    setShowClipping(!showLayerClipping);
    setShowAddAsset(false);
    setShowStreamProperties(false);
    setShowAddPush(false);
  };

  const unselectLayer = () => {
    console.log("Closing current layer");
    setShowLayerConfig(false);
    setSelectedLayer(null);
  };

  const selectLayerAndConfig = (idx, e) => {
    lastClickEvent.current = e;
    console.log("Opening context menu for layer " + idx);
    setSelectedLayer(currentStream.layers[idx]);
    setShowLayerConfig(true);
    setShowStreamProperties(false);
    setShowClipping(false);
    setShowAddAsset(false);
    setShowAddPush(false);
  };

  const switchLayerPositions = (posFrom, posTo) => {
    if (!currentStream || !currentStream.layers?.length) {
      return;
    }
    let maxIdx = currentStream.layers.length - 1;
    if (posFrom > maxIdx || posTo > maxIdx) {
      return;
    }
    const tmp = currentStream.layers[posTo];
    currentStream.layers[posTo] = currentStream.layers[posFrom];
    currentStream.layers[posFrom] = tmp;
    setNewStream(currentStream);
    forceUpdate();
  };

  const removeStreamByObj = (obj) => {
    removeStream(obj);
    setSelectedLayer(null);
  };

  // Adds a MediaStream to the state. Displays an error toast message on failure
  const addCamera = async (vidReq, audReq) => {
    const [mediaIn, type, videoConstraints, audioConstraints] =
      await requestCamera(vidReq, audReq);
    if (mediaIn) {
      if (!addMediaStream(mediaIn, type, videoConstraints, audioConstraints)) {
        setToast({
          event: lastClickEvent.current,
          message: "Could not add this device. Is it already connected?",
        });
      }
    }
    setShowAddAsset(false);
  };

  const addScreenShare = async () => {
    const stream = await requestScreen();
    if (stream) {
      if (!addMediaStream(stream, "screen", null)) {
        setToast({
          event: lastClickEvent.current,
          message: "Could not add screen share",
        });
      }
    }
    setShowAddAsset(false);
  };

  // Clears currentStream
  const clearPreview = () => {
    setNewStream(null);
  };

  const setNewStream = (streamObj) => {
    if (streamObj != currentStream) {
      setSelectedLayer(null);
    }
    setCurrentSteam(streamObj);
  };

  // Restores scenes and sources from cookie
  useEffect(() => {
    if (scenes.length || mediaSources.length) {
      return;
    }
    const newScenes = JSON.parse(localStorage.getItem("sourceConfig"));
    const oldStreams = JSON.parse(localStorage.getItem("sourceConfig"));
    if (!newScenes && !oldStreams) {
      return;
    }
    setShowConfigRestore(true);
  }, []);

  return (
    <div
      id="streamcrafter"
      className="row-container noselect darkFg"
      style={{
        maxWidth: "100vw",
        minWidth: "100vw",
        maxHeight: "100vh",
        minHeight: "100vh",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {/* Render modals */}
      <ConfigModals
        // Which configure window to render
        showStreamProperties={showStreamProperties}
        selectedLayer={selectedLayer}
        showLayerConfig={showLayerConfig}
        showAddAsset={showAddAsset}
        showAddPush={showAddPush}
        showLayerClipping={showLayerClipping}
        mediaSources={mediaSources}
        scenes={scenes}
        // And the current selected stream which we want to edit
        currentStream={currentStream}
        // And all active pushes to be able to stop them
        activePushes={activePushes}
        // Functions to mutate the state
        mutateMediaStream={mutateMediaStream}
        addCamera={addCamera}
        addScreenShare={addScreenShare}
        showConfigRestore={showConfigRestore}
        // Config restore
        requestCamera={requestCamera}
        setScenes={setScenes}
        setMediaStreams={setMediaStreams}
        setShowConfigRestore={setShowConfigRestore}
        requestScreen={requestScreen}
        // Function to toggle layer cropping
        toggleLayerClipping={toggleLayerClipping}
        // Function to close all modals
        closeModals={closeModals}
        // Modify broadcast settings
        broadcastCanvas={broadcastCanvas}
        mutateBroadcastCanvas={mutateBroadcastCanvas}
        // For displaying the context menu at the correct spot
        clickEvent={lastClickEvent.current}
      />
      <ToastNotif
        event={currentToast?.event}
        message={currentToast?.message}
        setToast={setToast}
      />
      <Header
        startBroadcast={startBroadcast}
        removeAllBroadcasts={removeAllBroadcasts}
        broadcastCanvas={broadcastCanvas}
        activePushes={activePushes}
      />
      {/* List of layers in the current scene */}
      <LayerList
        // Used to show which scene is currently maximized
        currentStream={currentStream}
        // Label layers by their source name
        mediaStreams={mediaSources}
        // Setters for the state
        setSelectedLayer={setSelectedLayer}
        selectLayerAndConfig={selectLayerAndConfig}
        selectedLayer={selectedLayer}
        switchLayerPositions={switchLayerPositions}
        // ignored={ignored}
      />
      {/* Render preview window */}
      <InteractivePreview
        broadcastCanvas={broadcastCanvas}
        currentStream={currentStream}
        selectedLayer={selectedLayer}
        setSelectedLayer={setSelectedLayer}
        selectLayerAndConfig={selectLayerAndConfig}
        unselectLayer={unselectLayer}
        mediaStreams={mediaSources}
        mutateMediaStream={mutateMediaStream}
        handleDrop={handleDrop}
        scenes={scenes.length}
        isErr={isErr}
      />
      {/* Sources, scenes and the mixer */}
      <Controls
        // All media streams we want to render a preview for
        scenes={scenes}
        mediaStreams={mediaSources}
        // Used to show which scene is currently maximized
        currentStream={currentStream}
        // Setters for the state
        removeStream={removeStreamByObj}
        clearPreview={clearPreview}
        setCurrentSteam={setNewStream}
        toggleShowStreamProperties={toggleShowStreamProperties}
        //
        isPushing={activePushes.length ? true : false}
        addCanvasStream={addCanvasStream}
        arrangeScene={arrangeScene}
        // Handle dragging/dropping buttons onto the canvas
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        toggleShowAddSource={toggleShowAddSource}
        // For the mixer
        mutateMediaStream={mutateMediaStream}
        audioState={audioState}
        toggleMixer={toggleMixer}
        setToggleMixer={setToggleMixer}
      />
      {/* Render active exports or Broadcasts */}
      {activePushes.map((obj, i) => {
        return (
          <MediaPush
            broadcastObj={obj}
            key={
              "stream-broadcast-" + obj.properties.preferredType + "-" + obj.id
            }
          />
        );
      })}
      {/* Render hidden videos for processing */}
      {mediaSources.map((mediaStream, i) => {
        if (!mediaStream.hasVideo) {
          return null;
        }
        return (
          <SourceRender
            mediaStream={mediaStream}
            removeStream={removeStreamByObj}
            key={"stream-source-" + mediaStream.id}
          />
        );
      })}
      {/* Render hidden scenes for processing */}
      {scenes.map((mediaStream, i) => {
        return (
          <CompositeRender
            mediaStream={mediaStream}
            mediaStreams={mediaSources}
            isCurrentStream={mediaStream == currentStream}
            key={"scene-render-" + mediaStream.id}
          />
        );
      })}
      {/* Renders a hidden canvas which to be used for broadcasting */}
      {broadcastCanvas ? (
        <BroadcastRender
          broadcastCanvas={broadcastCanvas}
          currentStream={currentStream}
          workerCompositor={workerCompositor}
          key={broadcastCanvas.id}
          setErr={setErr}
        />
      ) : null}
      {/* Render a bouncing DVD logo when there's no active stream */}
      {!currentStream ? (
        <div id="dvdlogo" style={{ animationDelay: randomDelay }}>
          {/* DVD Logo */}
          <svg width="153px" height="69px">
            <path d="M140.186,63.52h-1.695l-0.692,5.236h-0.847l0.77-5.236h-1.693l0.076-0.694h4.158L140.186,63.52L140.186,63.52z M146.346,68.756h-0.848v-4.545l0,0l-2.389,4.545l-1-4.545l0,0l-1.462,4.545h-0.771l1.924-5.931h0.695l0.924,4.006l2.078-4.006 h0.848V68.756L146.346,68.756z M126.027,0.063H95.352c0,0-8.129,9.592-9.654,11.434c-8.064,9.715-9.523,12.32-9.779,13.02 c0.063-0.699-0.256-3.304-3.686-13.148C71.282,8.7,68.359,0.062,68.359,0.062H57.881V0L32.35,0.063H13.169l-1.97,8.131 l14.543,0.062h3.365c9.336,0,15.055,3.747,13.467,10.354c-1.717,7.24-9.91,10.416-18.545,10.416h-3.24l4.191-17.783H10.502 L4.34,37.219h20.578c15.432,0,30.168-8.13,32.709-18.608c0.508-1.906,0.443-6.67-0.764-9.527c0-0.127-0.063-0.191-0.127-0.444 c-0.064-0.063-0.127-0.509,0.127-0.571c0.128-0.062,0.383,0.189,0.445,0.254c0.127,0.317,0.19,0.57,0.19,0.57l13.083,36.965 l33.344-37.6h14.1h3.365c9.337,0,15.055,3.747,13.528,10.354c-1.778,7.24-9.972,10.416-18.608,10.416h-3.238l4.191-17.783h-14.481 l-6.159,25.976h20.576c15.434,0,30.232-8.13,32.709-18.608C152.449,8.193,141.523,0.063,126.027,0.063L126.027,0.063z M71.091,45.981c-39.123,0-70.816,4.512-70.816,10.035c0,5.59,31.693,10.034,70.816,10.034c39.121,0,70.877-4.444,70.877-10.034 C141.968,50.493,110.212,45.981,71.091,45.981L71.091,45.981z M68.55,59.573c-8.956,0-16.196-1.523-16.196-3.365 c0-1.84,7.239-3.303,16.196-3.303c8.955,0,16.195,1.463,16.195,3.303C84.745,58.05,77.505,59.573,68.55,59.573L68.55,59.573z" />
          </svg>
        </div>
      ) : null}
    </div>
  );
};
