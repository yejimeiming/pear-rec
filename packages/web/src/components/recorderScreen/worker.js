/*
 *  Copyright (c) 2021 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

let x = 0;
let y = 0;
let width = 0;
let height = 0;

function transform(frame, controller) {
  // Cropping from an existing video frame is supported by the API in Chrome 94+.
  const newFrame = new VideoFrame(frame, {
    visibleRect: {
      x: x,
      width: width,
      y: y,
      height: height,
    },
  });
  controller.enqueue(newFrame);
  frame.close();
}

onmessage = async (event) => {
  const { operation, size } = event.data;
  if (operation === 'crop') {
    const { readable, writable } = event.data;
    x = size.x % 2 == 0 ? size.x + 2 : size.x + 1;
    y = size.y % 2 == 0 ? size.y + 2 : size.y + 1;
    width = size.width % 2 == 0 ? size.width - 4 : size.width - 3;
    height = size.height % 2 == 0 ? size.height - 4 : size.height - 3;
    readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable);
  } else {
    console.error('Unknown operation', operation);
  }
};
