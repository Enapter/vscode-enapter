import { Button } from "../components/button";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDevice } from "./device-provider";
import { useCommands } from "./commands-provider";
import { CommandIDs } from "../../constants/commands";
import { useVSCodeApi } from "./vscode-api-context";

const DeviceInfoItem = ({ title, value }: { title: string; value: any }) => {
  const formattedValue = useMemo(() => {
    if (value instanceof Date) {
      return value.toLocaleString();
    }

    return value;
  }, [value]);

  return (
    <li style={{ paddingBlock: "0.5rem" }}>
      <div style={{ fontWeight: 500, fontSize: "0.75rem" }}>{title}</div>
      <div>{formattedValue}</div>
    </li>
  );
};

const useDeviceConnectivityStatus = (deviceId: string) => {
  const [status, setStatus] = useState<string>("unknown");
  const vscode = useVSCodeApi();
  const interval = useRef<number | null>(null);

  const postRequest = useCallback(() => {
    vscode.postMessage({
      type: "request-device-connectivity-status",
      deviceId,
    });
  }, [vscode, deviceId]);

  const handleStatusChanged = useCallback(
    (e: any) => {
      const message = e.data;

      if (message.type !== "device-connectivity-status") {
        return;
      }

      setStatus(message.status);
    },
    [setStatus],
  );

  useEffect(() => {
    postRequest();
    window.addEventListener("message", handleStatusChanged);

    return () => {
      window.removeEventListener("message", handleStatusChanged);
    };
  }, [handleStatusChanged]);

  useEffect(() => {
    interval.current = window.setInterval(postRequest, 5000);

    return () => {
      if (interval.current) {
        window.clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, []);

  return status;
};

type DeviceConnectivityStatus = { deviceId: string };

const DeviceConnectivityStatus = ({ deviceId }: DeviceConnectivityStatus) => {
  const status = useDeviceConnectivityStatus(deviceId);

  return <DeviceInfoItem title={"Status"} value={status} />;
};

export const DeviceView = () => {
  const device = useDevice();
  const send = useCommands();

  const startUploadBlueprint = () => {
    send(CommandIDs.Blueprints.UploadToActiveDevice);
  };

  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <DeviceConnectivityStatus deviceId={device.id} />
        <DeviceInfoItem title={"Name"} value={device.name} />
        <DeviceInfoItem title={"Device ID"} value={device.id} />
        <DeviceInfoItem title={"Site ID"} value={device.site_id} />
        <DeviceInfoItem title={"Blueprint ID"} value={device.blueprint_id} />
        <DeviceInfoItem title={"Authorized Role"} value={device.authorized_role} />
        <DeviceInfoItem title={"Updated At"} value={device.updated_at} />
      </ul>

      <Button onClick={startUploadBlueprint} fullWidth>
        Upload Blueprint
      </Button>
    </div>
  );
};
