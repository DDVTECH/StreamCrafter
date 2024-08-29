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
      ingestUri={"http://localhost:8080/webrtc/live"}
      sceneWidth={1280}
      sceneHeight={720} 
    />
  }
}
```

Props:
- ingestUri (string): the WHIP endpoint the StreamCrafter should stream towards.
- sceneWidth (integer): Width in pixels of scenes. Defaults to 1280
- sceneHeight (integer): Height in pixels of scenes. Defaults to 720

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
