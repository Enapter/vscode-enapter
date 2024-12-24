import React, { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { useVSCodeApi } from "./vscode-api-context";

const CommandsContext = createContext<(command: string) => void>((_) => {});

export const CommandsProvider = ({ children }: PropsWithChildren) => {
  const vscode = useVSCodeApi();

  const send = useCallback((command: string) => {
    vscode.postMessage({ type: "command", command });
  }, []);

  return <CommandsContext.Provider value={send}>{children}</CommandsContext.Provider>;
};

export const useCommands = () => {
  return useContext(CommandsContext);
};
