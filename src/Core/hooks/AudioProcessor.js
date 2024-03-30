/*

  Hooks which takes a set of MediaStream sources and adds the processed and combined audio to the broadcast object
  Has controls for gain and compressor parameters

*/
import { useState, useEffect, createRef, useRef } from "react";

const useAudioProcessor = (broadcastCanvas, mediaStreams, ignored) => {
  // Will contain the destination audio track, after merging all inputs and applying gain and compressor controls
  const localAudio = useRef();
  // All audio sources we currently have connected to the media pipeline. Required when (re)connecting audio sources on config changes
  const [audioSources, setAudioSources] = useState([]);
  // Counter of audio tracks currently available. If this changes we need to reconnect audio sources
  const [streams, setStreams] = useState(0);
  // Keep the destination audio nodes persistent, so we can reconnect audio sources without interruption to audio playback
  const audioContext = useRef();

  // Disconnects all current sources, then connects all available sources according to their configuration
  const reconnectTracks = () => {
    if (!audioContext.current) {
      console.log(
        "Waiting for local audio context to be allocated before connecting source tracks"
      );
      return;
    }
    console.log("Reconnecting audio tracks to broadcast object");

    // Build a new list of audioSources
    const newSources = [];

    // Disconnect existing sources
    for (var idx = 0; idx < audioSources.length; idx++) {
      const sourceNode = audioSources[idx];
      sourceNode.sourceNodeRef.current.disconnect();
      sourceNode.sourceNodeRef.current = null;
      sourceNode.gainNodeRef.current.disconnect();
      sourceNode.gainNodeRef.current = null;
      sourceNode.analyserRef.current.disconnect();
      sourceNode.analyserRef.current = null;
      sourceNode.jsRef.current.disconnect();
      sourceNode.jsRef.current = null;
      sourceNode.stateRef.current = null;
    }

    // Now connect available audio sources according to their parameters
    for (const source of mediaStreams) {
      if (!source.mediaStreamRef.current.getAudioTracks().length) {
        console.log(
          "skipping adding audio source, as there is no audio track present ",
          source.id
        );
      } else {
        const newSource = {
          id: source.id,
          idx: newSources.length,
          sourceNodeRef: createRef(),
          gainNodeRef: createRef(),
          analyserRef: createRef(),
          jsRef: createRef(),
          stateRef: createRef(),
        };
        // Create new source node
        newSource.sourceNodeRef.current =
          audioContext.current.createMediaStreamSource(
            source.mediaStreamRef.current
          );
        // Create new gain node
        newSource.gainNodeRef.current = audioContext.current.createGain();
        const newVolume = source.properties.muted
          ? 0
          : Math.max(0, source.properties.volume / 100);
        newSource.gainNodeRef.current.gain.value = newVolume;
        // Create new analyser node
        newSource.analyserRef.current = audioContext.current.createAnalyser();
        newSource.analyserRef.current.smoothingTimeConstant = 0.8;
        newSource.analyserRef.current.fftSize = 1024;
        newSource.analyserRef.current.minDecibels = -100;
        newSource.analyserRef.current.maxDecibels = -10;
        newSource.jsRef.current = audioContext.current.createScriptProcessor(
          2048,
          1,
          1
        );
        newSource.jsRef.current.onaudioprocess = function () {
          if (
            !newSource.analyserRef.current?.frequencyBinCount ||
            !newSource.analyserRef.current
          ) {
            return;
          }
          var array = new Uint8Array(
            newSource.analyserRef.current.frequencyBinCount
          );
          newSource.analyserRef.current.getByteFrequencyData(array);

          let sum = 0;
          for (const amplitude of array) {
            sum += amplitude * amplitude;
          }

          const volume = Math.sqrt(sum / array.length);

          if (
            !newSource.stateRef.current ||
            newSource.stateRef.current?.volume != volume
          ) {
            newSource.stateRef.current = { volume: volume };
          }
        };

        // Reconnect to destination node
        newSource.sourceNodeRef.current.connect(newSource.gainNodeRef.current);
        newSource.gainNodeRef.current.connect(localAudio.current);
        newSource.gainNodeRef.current.connect(newSource.analyserRef.current);
        newSource.analyserRef.current.connect(newSource.jsRef.current);
        newSource.jsRef.current.connect(audioContext.current.destination);
        console.log(
          "connected source audio track at volume " + source.properties.volume,
          source.id,
          source.mediaStreamRef.current.getAudioTracks()
        );

        newSources.push(newSource);
      }
    }
    setAudioSources(newSources);
    setStreams(mediaStreams.length);
  };

  const reInit = (force) => {
    if (localAudio.current && !force) {
      return;
    }
    // We need a target to connect the destination node with
    if (!broadcastCanvas?.mediaStreamRef?.current) {
      console.log(
        "Waiting for broadcast context to be initialized before adding broadcast audio"
      );
      return;
    }
    if (!mediaStreams.length || (mediaStreams.length == streams && !force)) {
      console.log("Waiting for audio sources to appear");
      return;
    }
    console.log("Allocating audio processing context");
    // Allocate parts of the audio pipeline
    // source->compressor->gain->destination
    const newContext = new AudioContext();
    const newDestination = newContext.createMediaStreamDestination();
    // Reuse context later
    if (localAudio.current && force) {
      localAudio.current.disconnect();
    }
    localAudio.current = newDestination;
    audioContext.current = newContext;

    // Connect output tracks
    var audioTracks = newDestination.stream.getAudioTracks();
    for (const trk of audioTracks) {
      console.log("Adding broadcast audio track ", trk);
      broadcastCanvas.mediaStreamRef.current.addTrack(trk);
    }
  };

  // Init audio context if it's deallocated and we have available audio inputs
  useEffect(() => {
    reInit(false);
  }, [
    broadcastCanvas?.mediaStreamRef?.current,
    localAudio.current,
    mediaStreams.length,
  ]);

  // (Re)connect inputs to the compressor when streams come and go
  useEffect(() => {
    if (streams != mediaStreams.length) {
      console.log("Audio sources changed", mediaStreams.length, streams);
      reconnectTracks();
    }
  }, [localAudio.current, mediaStreams.length]);

  // Reconnect when the broadcast object changes
  useEffect(() => {
    console.log("Reconnecting since we have a new broadcast canvas");
    reInit(true);
  }, [broadcastCanvas.id]);

  // Check gain node settings
  useEffect(() => {
    for (const audioSrc of audioSources) {
      if (!audioSrc.gainNodeRef?.current) {
        continue;
      }
      for (const infoSrc of mediaStreams) {
        if (infoSrc.id == audioSrc.id) {
          const newVolume = infoSrc.properties.muted
            ? 0
            : Math.max(0, infoSrc.properties.volume / 100);
          if (audioSrc.gainNodeRef.current.gain.value != newVolume) {
            audioSrc.gainNodeRef.current.gain.value = newVolume;
          }
          break;
        }
      }
    }
  }, [mediaStreams?.length, ignored]);

  return [audioSources];
};

export default useAudioProcessor;
