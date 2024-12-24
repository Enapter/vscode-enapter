import { Button } from "../components/button";
import React, { useMemo } from "react";
import { useDevice } from "./device-provider";
import { useCommands } from "./commands-provider";
import { CommandIDs } from "../../web/constants/commands";

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

export const DeviceView = () => {
  const device = useDevice();
  const send = useCommands();

  const startUploadBlueprint = () => {
    send(CommandIDs.Blueprints.UploadToActiveDevice);
  };

  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0 }}>
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
