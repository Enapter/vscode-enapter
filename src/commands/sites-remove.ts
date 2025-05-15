import { ExtState } from "../ext-state";
import { CloudNode, GatewayNode } from "../sites-provider";

export const sitesRemove = async (node: CloudNode | GatewayNode) => {
  const extState = ExtState.getInstance();
  return extState.removeSite(node.remote);
};
