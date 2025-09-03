import { SitesCheckConnectionTask } from "../tasks/sites-check-connection-task";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";
import { SitesConnectionsService } from "../services/sites-connections-service";
import vscode from "vscode";
import { ViewIDs } from "../constants/views";
import { Logger } from "../logger";
import { ActiveDeviceService } from "../services/active-device-service";

export const sitesConnect = async (
  node: GatewayNode,
  sitesConnectionsService: SitesConnectionsService,
  devicesOnSiteService: DevicesOnSiteService,
  activeDeviceService: ActiveDeviceService,
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
        vscode.commands.executeCommand("setContext", "enapter.context.Sites.IsConnecting", true);
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
        await devicesOnSiteService.replaceAll([]);
        await sitesConnectionsService.disconnectById(site.id);
      } finally {
        vscode.commands.executeCommand("setContext", "enapter.context.Sites.IsConnecting", false);
        await activeDeviceService.replaceDevice(undefined);
      }
    },
  );
};
