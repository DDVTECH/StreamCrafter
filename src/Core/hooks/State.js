/*
  Contains the state and mutator functions
  Import this in the root component
  Acts as a middleware between the Web Worker and the DOM
*/
import { useState, useEffect, createRef, useReducer } from "react";
import useAudioProcessor from "./AudioProcessor";
import WorkerBuilder from "../workers/worker-builder";
import CompositorWorker from "../workers/compositor.worker";
// Cookies used to display the tutorial on first visit
//  or a changelog when new features roll out
import Cookies from "universal-cookie";

const useStreamCrafter = (ingestUri, sceneWidth, sceneHeight) => {
  const [cookies] = useState(
    new Cookies(null, {
      path: "/",
    })
  );
  // Main canvas to where we draw stuff for previewing and broadcasting
  const [broadcastCanvas, setBroadcastCanvas] = useState({
    mediaStreamRef: createRef(),
    mediaDOMRef: createRef(),
    isScene: false,
    // Global properties
    properties: {
      ingestUri: ingestUri,
      preferWhip: true,
      preferredType: "webrtc",
      preferredVideo: "h264",
      preferredAudio: "opus",
      defaultWidth: sceneWidth,
      defaultHeight: sceneHeight,
    },
    id: "broadcast-canvas" + makeid(5),
  });
  // List of all sources, coupled with config, info and ref's to their DOM element and MediaStreams
  const [mediaSources, setMediaStreams] = useState([]);
  // List of all scenes for the compositor, coupled with config, info and ref's to their DOM element and MediaStreams
  const [scenes, setScenes] = useState([]);
  // List of all active pushes from a broadcastCanvas to an external location or drive
  const [activePushes, setPushes] = useState([]);
  // Current active stream to edit/view
  const [currentStream, setCurrentSteam] = useState(null);
  // Force updates when updating nested state (like editing stream layer config)
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  // Connect media processor to broadcast object
  const [audioState] = useAudioProcessor(
    broadcastCanvas,
    mediaSources,
    ignored
  );
  const [workerCompositor] = useState(new WorkerBuilder(CompositorWorker));

  // Helper functions to create unique ID's
  function makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  // Functions to actually add specific inputs

  async function requestCamera(videoConstraints, audioConstraints) {
    console.log(audioConstraints);
    return navigator.mediaDevices
      .getUserMedia({
        audio: audioConstraints
          ? {
              deviceId: { exact: audioConstraints.deviceId },
              autoGainControl: true,
              echoCancellation: false,
              noiseSuppression: false,
              voiceIsolation: false,
            }
          : false,
        video: videoConstraints
          ? {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: videoConstraints.facingMode
                ? videoConstraints.facingMode
                : null,
              deviceId: { exact: videoConstraints.deviceId },
            }
          : false,
      })
      .then(function (stream) {
        let name = "camera";
        if (!videoConstraints) {
          name = "audio";
        }
        if (!audioConstraints) {
          name = "video";
        }
        return [stream, name, videoConstraints, audioConstraints];
      })
      .catch(function (e) {
        console.error("Could not request media device", e);
        return [null, null, null];
      });
  }

  async function requestScreen() {
    // Create a new CaptureController instance
    const controller = new CaptureController();
    controller.setFocusBehavior("no-focus-change");

    const stream = await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: {
          suppressLocalAudioPlayback: false,
        },
        monitorTypeSurfaces: "include",
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "include",
        surfaceSwitching: "exclude",
        controller: controller,
      })
      .then(function (stream) {
        return stream;
      })
      .catch(function (e) {
        console.error("Could not start screen share: ", e);
        return null;
      });
    return stream;
  }

  // Mutates state when passed props from parent component change
  useEffect(() => {
    broadcastCanvas.properties.ingestUri = ingestUri;
    setBroadcastCanvas(broadcastCanvas);
  }, [ingestUri]);

  // Stop all media tracks when this component gets destroyed
  useEffect(() => {
    workerCompositor.onerror = (err) => {
      console.log("Worker error: ", err);
    };
    // Stop all tracks when the component unloads
    return () => {
      workerCompositor.terminate();
      broadcastCanvas?.mediaStreamRef?.current
        ?.getTracks()
        .forEach(function (track) {
          track.stop();
        });
      mediaSources.map((inputObj) =>
        inputObj.mediaStreamRef?.current?.getTracks().forEach(function (track) {
          track.stop();
        })
      );
    };
  }, []);

  useEffect(() => {
    workerCompositor.onmessage = (e) => {
      // For each source that renders,
      if (e.data.evt == "getFrames") {
        if (!mediaSources.length) {
          return;
        }
        if (!currentStream) {
          return;
        }
        let index = 0;
        if (currentStream.isScene) {
          for (const layer of currentStream.layers) {
            let found = false;
            for (const mediaStream of mediaSources) {
              if (layer.srcId == mediaStream.id) {
                if (!mediaStream.mediaDOMRef.current) {
                  break;
                } else {
                  const videoFrame = new window.VideoFrame(
                    mediaStream.mediaDOMRef.current
                  );
                  workerCompositor.postMessage(
                    { frame: videoFrame, evt: "onFrame", index: index },
                    [videoFrame]
                  );
                }
                found = true;
                break;
              }
            }
            if (!found) {
              workerCompositor.postMessage(
                { frame: null, evt: "onFrame", index: index },
                []
              );
            }
            index++;
          }
        } else {
          if (!currentStream.mediaDOMRef.current) {
            return;
          }
          const videoFrame = new window.VideoFrame(
            currentStream.mediaDOMRef.current
          );
          workerCompositor.postMessage(
            { frame: videoFrame, evt: "onFrame", index: index },
            [videoFrame]
          );
        }
        return;
      }

      console.log("DOM received from worker: '" + e.data + "'");
    };
  }, [mediaSources.length, currentStream]);

  const scenesToCookie = (obj) => {
    let toSave = obj;
    if (!toSave) {
      toSave = scenes;
    }
    let cookieObj = [];
    for (const scene of toSave) {
      cookieObj.push({
        mediaStreamRef: null,
        mediaDOMRef: null,
        isScene: scene.isScene,
        layers: scene.layers,
        layerCounter: scene.layerCounter,
        properties: scene.properties,
        id: scene.id,
      });
    }
    localStorage.setItem("sceneConfig", JSON.stringify(cookieObj));
  };

  const sourcesToCookie = (_mediaSources) => {
    let cookieObj = [];
    let toSave = _mediaSources;
    if (!toSave) {
      toSave = mediaSources;
    }
    for (const source of toSave) {
      cookieObj.push({
        mediaStreamRef: null,
        mediaDOMRef: null,
        isScene: source.isScene,
        layers: source.layers,
        properties: source.properties,
        id: source.id,
        hasAudio: source.hasAudio,
        hasVideo: source.hasVideo,
        videoConstraints: source.videoConstraints,
        audioConstraints: source.audioConstraints,
        type: source.type,
      });
    }
    localStorage.setItem("sourceConfig", JSON.stringify(cookieObj));
  };

  const mutateCurrentStream = (obj) => {
    setCurrentSteam(obj);
    if (obj) {
      workerCompositor.postMessage(
        {
          currentStream: {
            layers: obj.layers,
            isScene: obj.isScene,
            properties: obj.properties,
            id: obj.id,
          },
          evt: "onCurrentStream",
        },
        []
      );
    } else {
      workerCompositor.postMessage(
        { currentStream: null, evt: "onCurrentStream" },
        []
      );
    }
  };

  // Create a new editable (canvas) MediaStream and append it to the state
  const addCanvasStream = () => {
    const newScene = {
      mediaStreamRef: createRef(),
      mediaDOMRef: createRef(),
      isScene: true,
      // Each layer has an input track id, properties
      layers: [],
      layerCounter: 0,
      // Global scene properties
      properties: {
        name: "scene " + (scenes.length + 1),
        autoSort: true,
        backgroundColor: "#434c5e",
        gridColor: "#a3be8c",
        width: sceneWidth,
        height: sceneHeight,
      },
      id: "scene-" + (+new Date() * Math.random()).toString(36).substring(0, 8),
    };
    const newScenes = [...scenes, newScene];
    scenesToCookie(newScenes);
    setScenes(newScenes);
  };

  // Swaps video sources around in the current scene
  const arrangeScene = () => {
    let hasSources = false;
    for (const input of mediaSources) {
      if (input.hasVideo) {
        hasSources = true;
        break;
      }
    }
    if (!hasSources) {
      return;
    }
    let newScenes = scenes;
    let thisScene = currentStream;
    // Make sure we have a scene selected, else we will add one
    if (!thisScene?.isScene) {
      return;
    }

    // First make sure all video sources are present
    for (const input of mediaSources) {
      if (!input.hasVideo) {
        continue;
      }
      let hasLayer = false;
      for (const layer of thisScene.layers) {
        if (layer.srcId == input.id) {
          hasLayer = true;
          break;
        }
      }
      if (!hasLayer) {
        thisScene.layerCounter++;
        thisScene.layers.push({
          id: input.id + makeid(5),
          srcId: input.id,
          properties: {
            x: 0,
            y: 0,
            opacity: 100,
            width: Math.min(thisScene.properties.width, input.properties.width),
            height: Math.min(
              thisScene.properties.height,
              input.properties.height
            ),
          },
          hiddenProperties: {
            aspectRatio: input.properties.width / input.properties.height,
            cropStartX: 0,
            cropStartY: 0,
            originalWidth: input.properties.width,
            originalHeight: input.properties.height,
            cropWidth: input.properties.width,
            cropHeight: input.properties.height,
          },
        });
      }
    }

    // Rotate layers around
    thisScene.layers.push(thisScene.layers.shift());
    // Arrange layers
    thisScene.layers[0].properties.width = thisScene.properties.width;
    thisScene.layers[0].properties.height = thisScene.properties.height;
    thisScene.layers[0].properties.x = 0;
    thisScene.layers[0].properties.y = 0;
    thisScene.layers[0].properties.opacity = 100;
    let layersPlaced = 0;
    for (var i = 1; i < thisScene.layers.length; i++) {
      thisScene.layers[i].properties.height = thisScene.properties.height / 2;
      thisScene.layers[i].properties.width = Math.min(
        thisScene.properties.width / 2,
        thisScene.layers[i].properties.height *
          (thisScene.layers[i].hiddenProperties.cropWidth /
            thisScene.layers[i].hiddenProperties.cropHeight)
      );
      thisScene.layers[i].properties.opacity = 50;
      if (layersPlaced == 0) {
        thisScene.layers[i].properties.x =
          thisScene.properties.width - thisScene.layers[i].properties.width;
        thisScene.layers[i].properties.y = 0;
      } else if (layersPlaced == 1) {
        thisScene.layers[i].properties.x =
          thisScene.properties.width - thisScene.layers[i].properties.width;
        thisScene.layers[i].properties.y =
          thisScene.properties.height - thisScene.layers[i].properties.height;
      } else if (layersPlaced == 2) {
        thisScene.layers[i].properties.x = 0;
        thisScene.layers[i].properties.y =
          thisScene.properties.height - thisScene.layers[i].properties.height;
      } else if (layersPlaced == 4) {
        thisScene.layers[i].properties.x = 0;
        thisScene.layers[i].properties.y = 0;
      }
      ++layersPlaced;
      if (layersPlaced >= 4) {
        break;
      }
    }

    mutateCurrentStream(thisScene);
    setScenes(newScenes);
    scenesToCookie(newScenes);
    forceUpdate();
    console.log("Arranged scene");
  };

  // Takes a MediaStream, adds it as a layer to CurrentStream
  const addLayer = (source) => {
    if (!currentStream.isScene) {
      return;
    }
    let newObj = currentStream;
    newObj.layerCounter++;
    newObj.layers.push({
      id: source.id + makeid(5),
      srcId: source.id,
      properties: {
        x: 0,
        y: 0,
        opacity: 100,
        width: Math.min(sceneWidth, source.properties.width),
        height: Math.min(sceneHeight, source.properties.height),
      },
      hiddenProperties: {
        aspectRatio: source.properties.width / source.properties.height,
        cropStartX: 0,
        cropStartY: 0,
        originalWidth: source.properties.width,
        originalHeight: source.properties.height,
        cropWidth: source.properties.width,
        cropHeight: source.properties.height,
      },
    });
    mutateMediaStream(newObj);
    console.log("Added layer to scene");
  };

  // Create a new raw input (video) MediaStream and append it to the state. type provides a hint for the name
  const addMediaStream = (
    mediaIn,
    type,
    videoConstraints,
    audioConstraints
  ) => {
    let newObj;
    try {
      newObj = {
        mediaStreamRef: createRef(),
        mediaDOMRef: createRef(),
        // Global properties
        isScene: false,
        hasAudio: false,
        hasVideo: false,
        properties: {
          name: type + " " + (mediaSources.length + 1),
        },
        videoConstraints: videoConstraints,
        audioConstraints: audioConstraints,
        type: type, //< screen or media
        id: mediaIn.id,
      };

      newObj.mediaStreamRef.current = mediaIn;
      if (mediaIn.getVideoTracks().length) {
        newObj.hasVideo = true;
      }
      if (mediaIn.getAudioTracks().length) {
        newObj.hasAudio = true;
        newObj.properties.volume = 100;
        newObj.properties.muted = false;
        newObj.properties.monitorAudio = false; //< Playback audio over local speakers
        newObj.properties.outputAudio = true; //< Use track in the audio mixer and AudioProcess
      }

      let added = 0;
      var tracks = mediaIn.getVideoTracks();
      for (const track of tracks) {
        if (added) {
          console.log("Skipping track " + track);
          continue;
        }
        added++;
        // Apply constraints to first video track we have
        var cap = track.getCapabilities();
        var cnstr = {};
        if (cap.frameRate && cap.frameRate.max) {
          cnstr.frameRate = {
            ideal: cap.frameRate.max,
            min: cap.frameRate.min,
            max: cap.frameRate.max > 30 ? 30 : cap.frameRate.max,
          };
        }
        track.applyConstraints(cnstr);
        let setts = track.getSettings();
        console.log("adding source ", setts);
        newObj.properties.height = setts.height;
        newObj.properties.width = setts.width;
      }
    } catch (e) {
      console.log("Capa errror (ignoring):", e);
      return;
    }

    let newMediaSources = [...mediaSources, newObj];
    setMediaStreams(newMediaSources);
    sourcesToCookie(newMediaSources);

    return true;
  };

  // Looks up the currentStream and overwrites it with the new object
  const mutateMediaStream = (mutatedObj) => {
    let newStreams;
    if (mutatedObj.isScene) {
      newStreams = scenes;
    } else {
      newStreams = mediaSources;
    }
    for (var idx = 0; idx < newStreams.length; idx++) {
      if (newStreams[idx].id == mutatedObj.id) {
        // Reorder layers based on surface area
        if (
          mutatedObj.properties?.autoSort &&
          (mutatedObj.isScene || mutatedObj.layers?.length)
        ) {
          function sortBySurfaceArea(a, b) {
            const aSurface = a.properties.width * a.properties.height;
            const bSurface = b.properties.width * b.properties.height;
            return bSurface - aSurface;
          }
          mutatedObj.layers = mutatedObj.layers.sort(sortBySurfaceArea);
        }
        // Store mutated object
        newStreams[idx] = mutatedObj;
        break;
      }
    }
    if (mutatedObj.isScene) {
      setScenes(newStreams);
      scenesToCookie(newStreams);
    } else {
      setMediaStreams(newStreams);
      sourcesToCookie(newStreams);
    }
    if (currentStream && mutatedObj.id == currentStream.id) {
      workerCompositor.postMessage(
        {
          currentStream: {
            layers: mutatedObj.layers,
            isScene: mutatedObj.isScene,
            properties: mutatedObj.properties,
            id: mutatedObj.id,
          },
          evt: "onCurrentStream",
        },
        []
      );
    }
    // Force rerender on nested state update
    forceUpdate();
  };

  // Overwrites it with the new object
  const mutateBroadcastCanvas = (mutatedObj, withReset) => {
    setBroadcastCanvas(mutatedObj);
    // Force rerender on nested state update
    forceUpdate();
    // Transfer properties to a new broadcast canvas object
    if (!withReset) {
      return;
    }
    console.log("resetting webworker");
    workerCompositor.postMessage(
      {
        evt: "halt",
      },
      []
    );
    console.log("creating new broadcast canvas");
    const newCanvasObj = {
      mediaStreamRef: createRef(),
      mediaDOMRef: createRef(),
      isScene: false,
      // Global properties
      properties: broadcastCanvas.properties,
      id: "broadcast-canvas" + makeid(5),
    };
    if (currentStream) {
      workerCompositor.postMessage(
        {
          currentStream: {
            layers: currentStream.layers,
            isScene: currentStream.isScene,
            properties: currentStream.properties,
            id: currentStream.id,
          },
          evt: "onCurrentStream",
        },
        []
      );
    } else {
      workerCompositor.postMessage(
        { currentStream: null, evt: "onCurrentStream" },
        []
      );
    }
    setBroadcastCanvas(newCanvasObj);
    // Force rerender on nested state update
    forceUpdate();
  };

  // Remove the MediaStream with the given index from the state
  const removeStream = (obj) => {
    if (currentStream && obj == currentStream) {
      mutateCurrentStream(null);
    }
    // Remove source stream
    if (!obj.isScene) {
      let newStreams = [];
      for (var stream of mediaSources) {
        if (stream.id == obj.id) {
          stream.mediaStreamRef?.current?.getTracks().forEach(function (track) {
            track.stop();
          });
          continue;
        }
        newStreams.push(stream);
      }
      setMediaStreams(newStreams);
      sourcesToCookie(newStreams);
    }
    // Remove scene and layer configs
    let newStreams = [];
    for (var stream of scenes) {
      if (stream.id == obj.id) {
        stream.mediaStreamRef?.current?.getTracks().forEach(function (track) {
          track.stop();
        });
        continue;
      }
      stream.layers = stream.layers.filter((val, _) => val.srcId !== obj.id);
      newStreams.push(stream);
    }
    setScenes(newStreams);
    scenesToCookie(newStreams);
  };

  // Starts a push from the broadcast canvas
  const startBroadcast = (properties) => {
    console.log("Starting a new push from the broadcast canvas");
    setPushes([
      ...activePushes,
      {
        sourceRef: broadcastCanvas.mediaStreamRef,
        properties: properties,
        active: true,
        id: makeid(5),
      },
    ]);
  };

  const removeAllBroadcasts = () => {
    setPushes([]);
  };

  return [
    // Variables
    currentStream,
    activePushes,
    mediaSources,
    scenes,
    broadcastCanvas,
    audioState,
    // Functions
    mutateCurrentStream,
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
  ];
};

export default useStreamCrafter;
