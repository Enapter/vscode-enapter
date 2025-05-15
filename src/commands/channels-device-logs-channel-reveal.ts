import { DeviceLogsChannel } from "../channels/device-logs-channel";

export const channelsDeviceLogsChannelReveal = () => {
  DeviceLogsChannel.getInstance().revealPanel();
};
