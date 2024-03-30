# streamcrafter

> In-browser compositor and broadcaster

[![NPM](https://img.shields.io/npm/v/streamcrafter.svg)](https://www.npmjs.com/package/streamcrafter) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save streamcrafter
```

## Usage

```jsx
import React, { Component } from 'react'

import { StreamCrafter } from 'streamcrafter'
import 'streamcrafter/dist/index.css'

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

## License

GPLv2 © [DDVTech](https://github.com/DDVTech)
