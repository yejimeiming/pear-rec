import { createContext } from 'react';

export const gifInitialState: any = {
  imgUrl: '',
  videoUrl: '',
  videoFrames: [],
  index: 0,
  load: 0,
};

export const GifContext = createContext(gifInitialState);

export function gifReducer(state, action) {
  switch (action.type) {
    case 'setVideoFrames': {
      return { ...state, videoFrames: action.videoFrames };
    }
    case 'setImgUrl': {
      return { ...state, imgUrl: action.imgUrl };
    }
    case 'setVideoUrl': {
      return { ...state, videoUrl: action.videoUrl };
    }
    case 'setIndex': {
      return { ...state, index: action.index };
    }
    case 'setLoad': {
      return { ...state, load: action.load };
    }
    default:
      throw new Error();
  }
}
