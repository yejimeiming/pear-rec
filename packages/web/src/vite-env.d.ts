/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    electronAPI: any;
    isElectron: boolean;
    isOffline: boolean;
    baseURL: string;
    showSaveFilePicker: any;
  }
}

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}
