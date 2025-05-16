import { ExtState } from "../ext-state";
import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";
import { CloudSiteNode } from "../providers/sites-connections/nodes/cloud-site-node";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";

export const sitesConnect = async (node: CloudSiteNode | GatewayNode) => {
  const { site } = node;

  if (site.isActive) {
    return;
  }

  const result = await SitesCheckConnectionTask.run(site);

  if (typeof result === "string" && result.length > 0) {
    node.setError(result);
    node.refresh();
    return;
  }

  node.setError(undefined);
  const state = ExtState.getInstance();
  void state.activateSite(site);
};
