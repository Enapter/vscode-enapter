import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useVSCodeApi } from "./vscode-api-context";
import { Button } from "../components/button";

type ExtSettingsContext = { apiKey: string; apiHost: string };
const ExtSettingsContext = createContext<{}>({} as ExtSettingsContext);

export const ExtSettingsProvider = ({ children }: PropsWithChildren) => {
  const vscode = useVSCodeApi();
  const [settings, setExtSettings] = useState<ExtSettingsContext | null>(null);

  useEffect(() => {
    vscode.postMessage({ type: "request-ext-settings" });

    window.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "ext-settings-updated") {
        setExtSettings({
          apiKey: message.apiKey,
          apiHost: message.apiHost,
        });
      }
    });
  }, []);

  if (!settings) {
    return null;
  }

  const handleOnOpenSettings = () => {
    vscode.postMessage({ type: "open-ext-settings" });
  };

  if (settings.apiKey === "" || settings.apiKey === "") {
    return (
      <div>
        <p>
          Please set your API key and API host in the{" "}
          <a href="command:workbench.action.openSettings?%5B%22Enapter%22%5D">extension settings</a>.
        </p>
        <Button onClick={handleOnOpenSettings} fullWidth>
          Configure Extension
        </Button>
      </div>
    );
  }

  return <ExtSettingsContext.Provider value={settings}>{children}</ExtSettingsContext.Provider>;
};

export const useExtSettings = () => {
  return useContext(ExtSettingsContext);
};
