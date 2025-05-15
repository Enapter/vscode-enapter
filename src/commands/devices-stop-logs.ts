import { DeviceLogsChannel } from "../channels/device-logs-channel";

export const devicesStopLogs = async () => {
  DeviceLogsChannel.getInstance().disconnect();
};
