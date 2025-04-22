import { ExtState } from "../ext-state";
import { CloudNode, GatewayNode } from "../sites-provider";

export const sitesConnect = async (node: CloudNode | GatewayNode) => {
  if (node.remote.isActive) {
    return;
  }

  const state = ExtState.getInstance();
  void state.activateSite(node.remote);
};
