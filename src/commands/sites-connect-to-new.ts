import { sitesConnectToGatewaySite } from "./sites-connect-to-gateway-site";
import { SitesConnectionsService } from "../services/sites-connections-service";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";
import vscode from "vscode";
import { ViewIDs } from "../constants/views";

export const sitesConnectToNew = async (
  sitesConnectionsService: SitesConnectionsService,
  devicesOnSiteService: DevicesOnSiteService,
) => {
  try {
    let site = await sitesConnectToGatewaySite(sitesConnectionsService);

    if (!site) {
      return;
    }

    site = sitesConnectionsService.getById(site.id);

    if (!site) {
      return;
    }

    if (!site.isActive) {
      return site;
    }

    const response = await vscode.window.withProgress({ location: { viewId: ViewIDs.Devices.AllOnRemote } }, async () =>
      DevicesFetchSiteDevicesTask.run(site),
    );

    if (!response) {
      return;
    } else {
      await devicesOnSiteService.replaceAll(response.devices);
    }

    return site;
  } catch (_) {
    /* empty */
  }
};
