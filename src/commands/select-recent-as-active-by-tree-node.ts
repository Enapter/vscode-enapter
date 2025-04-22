import { ExtState } from "../ext-state";
import { RecentDevicesTreeItem } from "../recent-devices-provider";

export const selectRecentAsActiveByTreeNode = (node: RecentDevicesTreeItem) => {
  const state = ExtState.getInstance();
  void state.setActiveDevice(node.device);
};
