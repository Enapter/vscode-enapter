import React, { createContext, PropsWithChildren, useContext, useRef } from "react";
import { WebviewApi } from "vscode-webview";

const VSCodeApiContext = createContext<WebviewApi<undefined> | null>(null);

export const VSCodeApiProvider = ({ children }: PropsWithChildren) => {
  const api = useRef(acquireVsCodeApi<undefined>());

  return <VSCodeApiContext.Provider value={api.current}>{children}</VSCodeApiContext.Provider>;
};

export const useVSCodeApi = () => {
  const ctx = useContext(VSCodeApiContext);

  if (!ctx) {
    throw new Error("useVSCodeApi must be used within a VSCodeApiProvider");
  }

  return ctx;
};
