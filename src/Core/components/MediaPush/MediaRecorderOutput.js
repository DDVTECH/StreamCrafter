/*

MP4	
  Chrome 3
  Edge 12
  Firefox
  Internet Explorer 9
  Opera 24
  Safari 3.1
  TODO: what is browser support %?

  VP9, AVC
  AAC, FLAC, MP3, OPUS

WEBM
  Crome 6
  Edge 17 (desktop only)
  Firefox 4
  Opera 10.6
  Safari 14.1 (macOS)
  Safari 15 (iOS).
  TODO: what is browser support %?

  AV1, VP8, VP9
  OPUS, VORBIS

  video/webm
  video/webm;codecs=vp8
  video/webm;codecs=vp9
  video/webm;codecs=vp8.0
  video/webm;codecs=vp9.0
  video/webm;codecs=h264
  video/webm;codecs=H264
  video/webm;codecs=avc1
  video/webm;codecs=vp8,opus
  video/WEBM;codecs=VP8,OPUS
  video/webm;codecs=vp9,opus
  video/webm;codecs=vp8,vp9,opus
  video/webm;codecs=h264,opus
  video/webm;codecs=h264,vp9,opus
  video/x-matroska;codecs=avc1

audio/webm

audio/webm;codecs=opus


*/
import { useState, useEffect, useRef } from "react";

const MediaRecorderOutput = (props) => {
  useEffect(() => {
    if (!props.mediaRef) {
      return;
    }

    console.log("MediaRecorder INGEST NOT IMPLEMENTED! Doing nothing...");
    return;

    const options = {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      mimeType: props.mimeType
    };

    const mediaRecorder = new MediaRecorder(props.mediaRef, options);
    console.log(mediaRecorder);

    mediaRecorder.onstop = (e) => {
      console.log("recorder stopped");
    };

    mediaRecorder.onerror = (e) => {
      console.log("recorder error:", e);
      mediaRecorder.stop();
    };

    mediaRecorder.ondataavailable = (e) => {
      console.log(e.data);
    };

    mediaRecorder.start(100);
    mediaRecorder.stop();
  }, [props.mediaRef]);

  if (!props.mediaRef) {
    return;
  }
};

export default MediaRecorderOutput;
