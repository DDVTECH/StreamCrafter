/*



*/
import React from 'react';
// Controls to edit layer properties
import LayerProperties from "./LayerProperties";
// Controls to edit stream properties
import StreamProperties from "./StreamProperties";
// Controls to add assets or scenes
import AddSource from "./AddSource";

import ContextMenu from "../Generic/ContextMenu";

import LayerClipping from "./LayerClipping";

import ConfigRestore from "./ConfigRestore";

const ConfigModals = (props) => {
  if (props.showConfigRestore) {
    return (
      <ConfigRestore
        requestCamera={props.requestCamera}
        setScenes={props.setScenes}
        setMediaStreams={props.setMediaStreams}
        setShowConfigRestore={props.setShowConfigRestore}
        requestScreen={props.requestScreen}
        broadcastCanvas={props.broadcastCanvas}
      />
    );
  }
  if (props.showLayerClipping) {
    let thisSource = null;
    // Find source layer stream
    for (const srcStream of props.mediaSources) {
      // Wait for rendered video to appear
      if (!srcStream.mediaDOMRef?.current || null) {
        continue;
      }
      if (!props.selectedLayer) {
        return;
      }
      if (srcStream.id != props.selectedLayer.srcId) {
        continue;
      }
      thisSource = srcStream;
      break;
    }
    return (
      <LayerClipping
        currentStream={props.currentStream}
        selectedLayer={props.selectedLayer}
        mutateMediaStream={props.mutateMediaStream}
        closeModals={props.closeModals}
        srcStream={thisSource}
      />
    );
  }
  if (props.showAddAsset) {
    return (
      <AddSource
        onStream={props.onStream}
        clickEvent={props.clickEvent}
        closeModals={props.closeModals}
        addCamera={props.addCamera}
        addScreenShare={props.addScreenShare}
        mediaSources={props.mediaSources}
      />
    );
  }

  if (props.showStreamProperties) {
    return (
      <ContextMenu
        clickEvent={props.clickEvent}
        title={props.currentStream?.properties?.name + " properties"}
        data={
          <StreamProperties
            currentStream={props.currentStream}
            mutateMediaStream={props.mutateMediaStream}
          />
        }
        closeModals={props.closeModals}
      />
    );
  }
  if (props.selectedLayer && props.showLayerConfig) {
    return (
      <ContextMenu
        clickEvent={props.clickEvent}
        title={"Edit Layer"}
        data={
          <LayerProperties
            broadcastCanvas={props.broadcastCanvas}
            currentStream={props.currentStream}
            selectedLayer={props.selectedLayer}
            mutateMediaStream={props.mutateMediaStream}
            toggleLayerClipping={props.toggleLayerClipping}
            closeModals={props.closeModals}
          />
        }
        closeModals={props.closeModals}
      />
    );
  }
};

export default ConfigModals;
