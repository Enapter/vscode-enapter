import { ExtState } from "../ext-state";
import { CloudNode, GatewayNode } from "../sites-provider";
import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";

export const sitesConnect = async (node: CloudNode | GatewayNode) => {
  const site = node.remote;

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
