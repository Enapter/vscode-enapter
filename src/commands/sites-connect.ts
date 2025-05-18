import { ExtState } from "../ext-state";
import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";
import { CloudSiteNode } from "../providers/sites-connections/nodes/cloud-site-node";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";

export const sitesConnect = async (node: CloudSiteNode | GatewayNode, devicesOnSiteService: DevicesOnSiteService) => {
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

  const response = await DevicesFetchSiteDevicesTask.run(site);

  if (!response) {
    node.setError("Failed to fetch devices");
    node.refresh();
    return;
  } else {
    await devicesOnSiteService.updateAll(response.devices);
  }

  node.setError(undefined);
  const state = ExtState.getInstance();
  void state.activateSite(site);
};
