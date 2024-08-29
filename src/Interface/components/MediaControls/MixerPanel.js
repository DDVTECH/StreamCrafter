/*



*/
import React from "react";
import JsonFieldEditor from "../JsonFieldEditor/JsonFieldEditor";
import VolumeIndicator from "./VolumeIndicator";
import {
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
  IoVolumeOff,
  IoVolumeMute,
} from "react-icons/io5";
import { IoTrash } from "react-icons/io5";

const MixerPanel = (props) => {
  return (
    <div
      className="row-container noselect flex-grow"
      style={{
        justifyContent: "flex-start",
        flex: 1,
        height: "100%",
      }}
    >
      <div
        className="flex-parent darkFg backgroundBorderTop backgroundBorderRight"
        style={{
          justifyContent: "center",
          width: "8em",
        }}
      >
        <h4 className="nopad">Audio Mixer</h4>
      </div>
      <div
        className="row-container darkBg backgroundBorderTop backgroundBorderBot"
        style={{
          justifyContent: "flex-start",
          height: "100%",
          overflowY: "auto",
          display: "flex",
          minHeight: "0px",
        }}
      >
        {props.audioState.map((srcAudioCtx, i) => {
          let source = null;
          for (const src of props.mediaSources) {
            if (!src.hasAudio) {
              continue;
            }
            if (src.id == srcAudioCtx.id) {
              source = src;
              break;
            }
          }
          if (!source) {
            return;
          }
          let style = "row-container noselect";
          if (i > 0) {
            style += " backgroundBorderTop";
          }
          let sliderHasOverride = true;
          let override = 0;
          let boolIcon = <IoVolumeMute className="maximized" />;
          if (!source.properties.muted) {
            sliderHasOverride = false;
            override = null;
            const thisVol = Math.min(100, source.properties.volume);
            if (thisVol < 5) {
              boolIcon = <IoVolumeOff className="maximized" />;
            } else if (thisVol < 33) {
              boolIcon = <IoVolumeLow className="maximized" />;
            } else if (thisVol < 66) {
              boolIcon = <IoVolumeMedium className="maximized" />;
            } else {
              boolIcon = <IoVolumeHigh className="maximized" />;
            }
          }

          const setNewProperties = (newProperties) => {
            let newObj = source;
            newObj.properties = newProperties;
            props.mutateMediaStream(newObj);
          };

          return (
            <div
              className={style}
              style={{
                justifyContent: "space-between",
                maxHeight: "5em",
                height: "5em",
                minHeight: "5em",
              }}
              key={"mixer-source-" + i}
            >
              <h4 className="nopad">{source.properties.name}</h4>
              <div
                className="column-container"
                style={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  alignContent: "flex-start",
                }}
              >
                <div
                  className="row-container"
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                >
                  <div
                    className="column-container"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <VolumeIndicator
                      stateRef={srcAudioCtx.stateRef}
                      id={source.id}
                      disabled={null}
                    />
                  </div>

                  <div
                    className="column-container"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <JsonFieldEditor
                      name={"volume"}
                      title={""}
                      thisProperties={source.properties}
                      setNewProperties={setNewProperties}
                      forceType={"slider"}
                      autoApply={true}
                      hideValue={true}
                      maxValue={100}
                      minValue={0}
                      forceValue={
                        sliderHasOverride ? { value: override } : null
                      }
                    />
                  </div>
                </div>
                <div
                  className="row-container"
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                    width: "unset",
                  }}
                >
                  <div
                    className="column-container"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <div
                      className="media-button flex-item nopad noborder redColor"
                      style={{
                        height: "100%",
                        aspectRatio: "1",
                        textAlign: "center",
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        display: "flex",
                        minWidth: "2em",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        props.removeStream(source);
                      }}
                    >
                      <IoTrash className="maximized" />
                    </div>
                  </div>
                  <div
                    className="column-container"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <JsonFieldEditor
                      name={"muted"}
                      title={null}
                      thisProperties={source.properties}
                      setNewProperties={setNewProperties}
                      forceType={"boolean"}
                      autoApply={true}
                      icon={boolIcon}
                      forceValue={null}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MixerPanel;
