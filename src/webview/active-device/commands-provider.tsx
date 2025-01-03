import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useVSCodeApi } from "./vscode-api-context";
import { CommandID } from "../../constants/commands";

type CommandsContextType = {
  send: (command: CommandID) => void;
  checkIfRunning: (command: CommandID) => boolean;
};

const CommandsContext = createContext<CommandsContextType>({} as CommandsContextType);

export const CommandsProvider = ({ children }: PropsWithChildren) => {
  const vscode = useVSCodeApi();

  const [runningCommands, setRunningCommands] = useState<Partial<Record<CommandID, boolean>>>({});

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "command-started") {
        setRunningCommands((prev) => {
          return { ...prev, [message.command]: true };
        });
      }

      if (message.type === "command-finished") {
        setRunningCommands((prev) => {
          return { ...prev, [message.command]: false };
        });
      }
    });
  }, []);

  const send = useCallback<CommandsContextType["send"]>(
    (command) => {
      vscode.postMessage({ type: "command", command });
      setRunningCommands((prev) => {
        if (prev[command]) {
          return prev;
        }

        return { ...prev, [command]: true };
      });
    },
    [vscode],
  );

  const checkIfRunning = useCallback<CommandsContextType["checkIfRunning"]>(
    (command) => {
      return !!runningCommands[command];
    },
    [runningCommands],
  );

  const contextValue = useMemo(() => ({ send, checkIfRunning }), [send, checkIfRunning]);

  return <CommandsContext.Provider value={contextValue}>{children}</CommandsContext.Provider>;
};

export const useCommands = () => {
  return useContext(CommandsContext);
};
