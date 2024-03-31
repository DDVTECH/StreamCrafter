# streamcrafter

> In-browser compositor and broadcaster

[![NPM](https://img.shields.io/npm/v/@optimist-video/streamcrafter.svg)](https://www.npmjs.com/package/@optimist-video/streamcrafter)

## Install

```bash
npm install --save @optimist-video/streamcrafter
```

## Usage

```jsx
import React, { Component } from 'react'

import { StreamCrafter } from '@optimist-video/streamcrafter'
import '@optimist-video/streamcrafter/dist/index.css'

class Example extends Component {
  render() {
    return <StreamCrafter
      whipIngest={"http://localhost:8080/webrtc/live"}
      mistHost={"localhost"}
      mistPath={"/view"}
      streamName={"live"}
      useWebWorker={true}
      broadcastWidth={1280}
      broadcastHeight={720}
      shareUri={"http://localhost:8080/live.html"} />
  }
}
```

Props:
- whipIngest: the WHIP endpoint the StreamCrafter should stream towards.
- streamName: When using MistServer: Stream name the StreamCrafter should stream towards.
- mistHost: When using MistServer: IP address or hostname of the MistServer instance. Specify the port when not using port 80.
- mistPath: When using MistServer behind a reverse proxy: subpath to route all requests to. Leave empty if MistServer is accessible from the root path.
- useWebWorker: boolean true/false. Start the StreamCrafter in Web Worker mode, which is experimental but can run in the background (to some extent).
- broadcastWidth: Width in pixels (integer) of the broadcasted stream
- broadcastHeight: Height in pixels (integer) of the broadcasted stream
- shareUri: Link the streamer can use to share and view the ingested stream on

### Disclaimer
The StreamCrafter is in an alpha state. It is useable, but can and will change a lot in the coming months.

It makes heavy use of animation loops to do all of the rendering and processing required for rendering scenes.There's a fundamental issue with animation loops in browsers: in order to keep system usage low, animation loops get suspended the moment a web page is no longer visible. 

**It's advised to run the StreamCrafter in a separate window to prevent the broadcast from being interrupted by the browser trying to save on resources.**

Here is how we're solving this issue in future builds of the StreamCrafter:

There already is an experimental Web Worker mode. It's less efficient but works! Enabling it should allow you to safely tab away during a broadcast.
For the 'real' solution we're waiting for a specific browser API to roll out to browsers in the near future, which would allow web workers access to the video buffer directly. As soon as this feature gets picked up by major browsers the experimental Web Worker mode will become the default.

## Run your own MistServer CDN
This will at some point contain instructions for:
- Installing MistServer
- Enabling HTTPS
- Configuring a stream
- Use the StreamCrafter with your own MistServer instance
- View stream / embed the player
- Load Balance multiple MistServer nodes

## License

GPLv2 © [DDVTech](https://github.com/DDVTech)
