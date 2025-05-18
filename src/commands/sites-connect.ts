import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";
import { CloudSiteNode } from "../providers/sites-connections/nodes/cloud-site-node";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";
import { SitesConnectionsService } from "../services/sites-connections-service";
import vscode from "vscode";
import { ViewIDs } from "../constants/views";

export const sitesConnect = async (
  node: CloudSiteNode | GatewayNode,
  sitesConnectionsService: SitesConnectionsService,
  devicesOnSiteService: DevicesOnSiteService,
) => {
  return vscode.window.withProgress(
    {
      location: { viewId: ViewIDs.Sites.All },
    },
    async () => {
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
      return sitesConnectionsService.connectById(site.id);
    },
  );
};
