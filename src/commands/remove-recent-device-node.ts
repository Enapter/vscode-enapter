import { ExtState } from "../ext-state";
import { RecentDevicesTreeItem } from "../recent-devices-provider";

export const removeRecentDeviceNode = (node: RecentDevicesTreeItem) => {
  const state = ExtState.getInstance();
  void state.removeRecentDevice(node.device);
};
