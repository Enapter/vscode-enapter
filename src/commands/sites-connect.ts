import { ExtState } from "../ext-state";
import { CloudNode, GatewayNode } from "../sites-provider";
import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";

export const sitesConnect = async (node: CloudNode | GatewayNode) => {
  const site = node.remote;

  if (site.isActive) {
    return;
  }

  const isConnected = await SitesCheckConnectionTask.run(site);

  if (!isConnected) {
    return;
  }

  const state = ExtState.getInstance();
  void state.activateSite(site);
};
