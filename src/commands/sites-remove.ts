import { ExtState } from "../ext-state";
import { CloudSiteNode } from "../providers/sites-connections/nodes/cloud-site-node";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";

export const sitesRemove = async (node: CloudSiteNode | GatewayNode) => {
  const extState = ExtState.getInstance();
  return extState.removeSite(node.site);
};
