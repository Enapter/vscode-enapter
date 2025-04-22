import { ExtState } from "../ext-state";
import { CloudNode, GatewayNode } from "../sites-provider";

export const sitesDisconnect = async (node: CloudNode | GatewayNode) => {
  const state = ExtState.getInstance();
  void state.removeSite(node.remote);
};
