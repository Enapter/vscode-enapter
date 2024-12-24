import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import type { Device } from "../../models/device";
import { SelectDevice } from "./select-device";
import { useVSCodeApi } from "./vscode-api-context";

const DeviceContext = createContext<Device>({} as Device);

// TODO: add type for stringified Device type
const formatDevice = (device: Device): Device | null => {
  if (!device) {
    return null;
  }

  return {
    ...device,
    updated_at: new Date(device.updated_at),
  };
};

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const vscode = useVSCodeApi();
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    vscode.postMessage({ type: "request-persisted-device" });

    window.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "device-selected") {
        setDevice(formatDevice(message.device));
      }
    });
  }, []);

  if (!device) {
    return <SelectDevice />;
  }

  return <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>;
};

export const useDevice = () => {
  return useContext(DeviceContext);
};
