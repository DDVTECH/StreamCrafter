import { useEffect, useRef } from "react";
import React from 'react';
/*

Renders screenshares, webcams and other raw inputs into a secret video object
this way it can be used to draw to a canvas
and the audio can be extracted for mixing

*/

const SourceRender = ({ mediaStream, removeStream }) => {
  const localVideo = useRef();

  useEffect(() => {
    if (mediaStream.mediaStreamRef?.current) {
      if (!mediaStream.mediaStreamRef?.current.active) {
        removeStream(mediaStream);
        return;
      }
      // Go go gadget autoplay
      var onVideoLoaded = () => {
        localVideo.current.play();
      };
      localVideo.current.autoplay = true;
      localVideo.current.addEventListener("loadeddata", onVideoLoaded);
      // Finally load the video track to prerender
      localVideo.current.srcObject = mediaStream.mediaStreamRef.current;
      mediaStream.mediaDOMRef.current = localVideo.current;
      console.log("Rendering source MediaStream for id " + mediaStream.id);
    }
  }, [
    mediaStream.mediaStreamRef?.current,
    mediaStream.mediaStreamRef?.current?.active,
  ]);

  return (
    <video
      control="false"
      playsInline
      autoPlay={true}
      muted="muted"
      ref={localVideo}
      height={mediaStream.properties?.height || 0}
      width={mediaStream.properties?.width || 0}
      hidden
    />
  );
};

export default SourceRender;
