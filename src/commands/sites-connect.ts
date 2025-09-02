import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";
import { SitesConnectionsService } from "../services/sites-connections-service";
import vscode from "vscode";
import { ViewIDs } from "../constants/views";
import { Logger } from "../logger";

export const sitesConnect = async (
  node: GatewayNode,
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

      try {
        const result = await SitesCheckConnectionTask.run(site);

        if (typeof result === "string" && result.length > 0) {
          node.setError(result);
          node.refresh();
          return;
        }

        await sitesConnectionsService.connectById(site.id);

        const response = await vscode.window.withProgress({ location: { viewId: ViewIDs.Devices.AllOnRemote } }, () =>
          DevicesFetchSiteDevicesTask.run(site),
        );

        if (!response) {
          node.setError("Failed to fetch devices");
          node.refresh();
          return;
        } else {
          await devicesOnSiteService.replaceAll(response.devices);
        }

        node.setError(undefined);
        return site;
      } catch (e) {
        Logger.log(e);
        await sitesConnectionsService.disconnectById(site.id);
        await devicesOnSiteService.replaceAll([]);
      }
    },
  );
};
