import { ExtState } from "../ext-state";
import { DeviceOnSiteNode } from "../providers/devices-on-site/nodes/device-on-site-node";

export const devicesConnect = (node: DeviceOnSiteNode) => {
  const state = ExtState.getInstance();
  return state.setActiveDevice(node.device);
};
