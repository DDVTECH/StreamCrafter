/*

  Exports a list of available devices and functions to add them
  Sends a MediaStream with tag to the given callback function

*/
import { useEffect, useState } from "react";
const useCapture = () => {
  let [deviceList, setDevices] = useState(
    JSON.parse(localStorage.getItem("deviceList") || "[]")
  );

  // On render, get permissions for enumerating by retrieving cams + mics
  async function getDevices() {
    // First make a call to get cam/mic permissions
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    // Then enumerate capa's
    return await navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        return gotDevices(devices);
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  }

  function gotDevices(deviceInfos) {
    const list = [];
    let micCount = 1;
    let speakerCount = 1;
    let camCount = 1;
    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      if (deviceInfo.deviceId == "" || deviceInfo.groupId == "") {
        console.log("Skipping enumerating device without permission");
        continue;
      }
      if (deviceInfo.kind == "audiooutput") {
        console.log("Skipping enumerating audio output device");
        continue;
      }
      let obj = {
        deviceId: deviceInfo.deviceId,
        groupId: deviceInfo.groupId,
        kind: deviceInfo.kind,
        label: deviceInfo.label,
        index: i,
      };
      if (deviceInfo.kind === "audioinput") {
        obj.type = "Mic";
        if (obj.label == "") {
          obj.label = "Microphone " + micCount;
          ++micCount;
        }
      } else if (deviceInfo.kind === "audiooutput") {
        obj.type = "Speaker";
        if (obj.label == "") {
          obj.label = "Speaker " + speakerCount;
          ++speakerCount;
        }
      } else if (deviceInfo.kind === "videoinput") {
        obj.type = "Cam";
        if (obj.label == "") {
          obj.label = "Camera " + camCount;
          ++camCount;
        }
      }

      list.push(obj);
    }
    return list;
  }

  useEffect(() => {
    async function enumerateDevices() {
      let devices = await getDevices();
      setDevices(devices);
      localStorage.setItem("deviceList", JSON.stringify(devices));
    }
    enumerateDevices();
  }, []);

  return deviceList;
};

export default useCapture;
