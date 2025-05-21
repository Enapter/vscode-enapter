import { SitesSelectTypeTask } from "../tasks/sites-select-type-task";
import { Site, SiteType } from "../models/sites/site";
import { sitesConnectToCloudSite } from "./sites-connect-to-cloud-site";
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
    const siteType = await SitesSelectTypeTask.run();
    let site: Site | undefined = undefined;

    if (siteType === SiteType.Cloud) {
      site = await sitesConnectToCloudSite(sitesConnectionsService);
    }

    if (siteType === SiteType.Gateway) {
      site = await sitesConnectToGatewaySite(sitesConnectionsService);
    }

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
      await devicesOnSiteService.updateAll(response.devices);
    }

    return site;
  } catch (_) {
    /* empty */
  }
};
