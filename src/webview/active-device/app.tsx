import React, { useEffect } from "react";
import "./app.module.css";
import { createRoot } from "react-dom/client";
import { DeviceProvider } from "./device-provider";
import { CommandsProvider } from "./commands-provider";
import { VSCodeApiProvider } from "./vscode-api-context";
import { DeviceView } from "./device-view";
import { ExtSettingsProvider } from "./ext-settings-provider";

const App = () => {
  return (
    <VSCodeApiProvider>
      <ExtSettingsProvider>
        <CommandsProvider>
          <DeviceProvider>
            <DeviceView />
          </DeviceProvider>
        </CommandsProvider>
      </ExtSettingsProvider>
    </VSCodeApiProvider>
  );
};

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
