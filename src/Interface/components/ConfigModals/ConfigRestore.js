/*



*/
import React from 'react';
import { useEffect, createRef, useState } from "react";
import { IoTrash, IoAddCircle } from "react-icons/io5";
import CenterModal from "../Generic/CenterModal";
import MediaStreamPreview from "../Generic/MediaStreamPreview";

const ConfigRestore = (props) => {
  const [oldScenes] = useState(
    JSON.parse(localStorage.getItem("sceneConfig")) || []
  );
  const [oldStreams] = useState(
    JSON.parse(localStorage.getItem("sourceConfig")) || []
  );
  const [newMediaSources, setNewSources] = useState([]);
  const [newScenes, setNewScenes] = useState([]);
  const [sourcesTodo, setSourcesTodo] = useState([]);
  const [todoIndex, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  // Apply changes when finished
  useEffect(() => {
    if (!inProgress) {
      return;
    }
    if (!done && todoIndex >= sourcesTodo.length) {
      setDone(true);
    }
  }, [todoIndex, inProgress]);

  useEffect(() => {
    if (!done) {
      return;
    }
    console.log("Finished restoring sources. Applying...");
    let newNewScenes = [];
    if (newScenes) {
      // For each scene, check if the source is still connected. Else remove it's layers
      for (const scene of newScenes) {
        let newLayers = [];
        // Add layers which still have it's media source
        for (const layer of scene.layers) {
          for (const stream of newMediaSources) {
            if (layer.srcId == stream.id) {
              newLayers.push(layer);
              break;
            }
          }
        }
        // Drop any empty layers
        if (!newLayers.length) {
          continue;
        }
        scene.layers = newLayers;
        newNewScenes.push(scene);
      }
    }

    props.setScenes(newNewScenes);
    props.setMediaStreams(newMediaSources);
    props.setShowConfigRestore(false);
  }, [done]);

  // Restores whichever sources we can in the background
  useEffect(() => {
    console.log("Restoring config from local storage");
    const recover = async () => {
      let newNewMediaSources = [];
      let sourcesTodo = [];
      if (oldStreams) {
        for (const stream of oldStreams) {
          if (stream.videoConstraints || stream.audioConstraints) {
            const [mediaIn, type, videoConstraints, audioConstraints] =
              await props.requestCamera(
                stream.videoConstraints,
                stream.audioConstraints
              );
            if (mediaIn) {
              stream.mediaStreamRef = createRef();
              stream.mediaDOMRef = createRef();
              stream.mediaStreamRef.current = mediaIn;
              stream.videoConstraints = videoConstraints;
              stream.audioConstraints = audioConstraints;
              if (stream.hasVideo) {
                console.log("Re-added video source ", stream);
              } else if (stream.hasAudio) {
                console.log("Re-added audio source ", stream);
              }
              newNewMediaSources.push(stream);
              continue;
            }
          }
          // If it was not included in any scene, let's just drop the source at this point
          let found = false;
          for (const scene of oldScenes) {
            for (const layer of scene.layers) {
              if (layer.srcId == stream.id) {
                found = true;
                break;
              }
            }
            if (found) {
              break;
            }
          }
          if (stream.type != "screen") {
            console.log(
              "Dropping stream as restoring streams of type " +
                stream.type +
                " is not implemented yet",
              stream
            );
            continue;
          }
          sourcesTodo.push(stream);
        }
      }

      let newScenes = [];
      if (oldScenes) {
        // For each scene, check if the source is still connected. Else remove it's layers
        for (const scene of oldScenes) {
          // Drop any empty scenes
          if (!scene.layers.length) {
            continue;
          }
          scene.mediaStreamRef = createRef();
          scene.mediaDOMRef = createRef();
          newScenes.push(scene);
        }
      }

      setNewSources(newNewMediaSources);
      setNewScenes(newScenes);
      setInProgress(true);
      setIndex(0);
      setSourcesTodo(sourcesTodo);
      props.setMediaStreams(newNewMediaSources);
      props.setScenes(newScenes);
      if (!sourcesTodo.length) {
        setDone(true);
      }
    };
    recover();
  }, []);

  const incrementCounter = () => {
    console.log("Dropping stream ", sourcesTodo[todoIndex]);
    setIndex(todoIndex + 1);
  };

  const reAddScreenShare = async () => {
    const streamSrc = await props.requestScreen();
    if (streamSrc) {
      const stream = sourcesTodo[todoIndex];
      stream.mediaStreamRef = createRef();
      stream.mediaDOMRef = createRef();
      stream.mediaStreamRef.current = streamSrc;

      if (stream.hasVideo) {
        console.log("Re-added video source ", stream);
      } else if (stream.hasAudio) {
        console.log("Re-added audio source ", stream);
      }
      const newSources = [...newMediaSources, stream];
      setNewSources(newSources);
      props.setMediaStreams(newSources);
      setIndex(todoIndex + 1);
    }
  };

  if (!inProgress || done || todoIndex >= sourcesTodo.length) {
    return null;
  }

  const missingSource = sourcesTodo[todoIndex];
  if (!missingSource) {
    setDone(true);
  }

  // At this point we want to prompt the user to reconnect this source or drop it
  if (missingSource.type != "screen") {
    return null;
  }

  let sceneInfo = [];
  for (const scene of newScenes) {
    let layers = [];
    for (const layer of scene.layers) {
      if (layer.srcId == missingSource.id) {
        layers.push(layer);
      }
    }
    if (!layers.length) {
      continue;
    }
    sceneInfo.push({
      layerInfo: layers,
      sceneInfo: scene,
    });
  }
  return (
    <CenterModal
      title={"Restore screen share"}
      data={
        <ul>
          <p>
            During your previous visit there was a screen share labelled '
            {missingSource.properties.name}'
          </p>
          <p>
            You can add a new screen share to replace it or drop that source
          </p>
          <div
            className="column-container-min"
            style={{
              textAlign: "center",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
            }}
          >
            {sceneInfo.map((obj, i) => {
              return (
                <div
                  key={"config-restore-scene-preview-" + i}
                  className={
                    "container flex-item flex-grow nopad backgroundBorder"
                  }
                  style={{
                    borderRadius: "0.3em",
                    maxHeight: "100%",
                    maxWidth: "20em",
                  }}
                >
                  <div
                    className="flex-parent darkFg backgroundBorderBot"
                    style={{
                      justifyContent: "center",
                    }}
                  >
                    <h4 className="nopad">{obj.sceneInfo.properties.name}</h4>
                  </div>
                  <div className="flex-parent">
                    <MediaStreamPreview
                      stream={obj.sceneInfo.mediaStreamRef.current}
                      roundedBottoms={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="column-container"
            style={{
              textAlign: "center",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
              height: "4em",
              marginTop: "1em",
            }}
          >
            <button
              className="column-container action-button noborder"
              style={{
                height: "100%",
                textAlign: "center",
                alignContent: "center",
                alignItems: "center",
              }}
              onClick={reAddScreenShare}
            >
              <h2
                className="flex-item nopad noborder"
                style={{ marginRight: "0.2em" }}
              >
                Re-add screen share
              </h2>
              <div
                className="flex-item flex-grow noborder"
                style={{ height: "100%", aspectRatio: "1" }}
              >
                <IoAddCircle className="maximized" />
              </div>
            </button>
            <button
              className="column-container action-button noborder"
              style={{
                height: "100%",
                textAlign: "center",
                alignContent: "center",
                alignItems: "center",
              }}
              onClick={incrementCounter}
            >
              <h2
                className="flex-item nopad noborder"
                style={{ marginRight: "0.2em" }}
              >
                Drop source
              </h2>
              <div
                className="flex-item flex-grow noborder redColor"
                style={{ height: "100%", aspectRatio: "1" }}
              >
                <IoTrash className="maximized" />
              </div>
            </button>
          </div>
        </ul>
      }
      closeModals={incrementCounter}
    />
  );
};

export default ConfigRestore;
