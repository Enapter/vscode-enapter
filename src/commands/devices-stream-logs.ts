import { DeviceLogsChannel } from "../channels/device-logs-channel";
import { LogsNode } from "../providers/active-device/nodes/logs-node";

export const devicesStreamLogs = async (node: LogsNode) => {
  const channel = DeviceLogsChannel.getInstance();
  return channel.connectTo(node.device);
};
