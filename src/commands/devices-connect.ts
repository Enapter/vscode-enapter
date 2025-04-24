import { ExtState } from "../ext-state";
import { RemoteDeviceNode } from "../devices-all-on-site-provider";

export const devicesConnect = (node: RemoteDeviceNode) => {
  const state = ExtState.getInstance();
  void state.setActiveDevice(node.device);
};
