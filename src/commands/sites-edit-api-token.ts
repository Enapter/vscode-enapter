import { SitesConnectionsService } from "../services/sites-connections-service";
import { SiteType } from "../models/sites/site";
import vscode from "vscode";
import { Logger } from "../logger";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { ExtState } from "../ext-state";
import { sitesConnect } from "./sites-connect";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { ActiveDeviceService } from "../services/active-device-service";
import { ApiTokenNode } from "../providers/sites-connections/nodes/api-token-node";

export const sitesEditApiToken = async (
  node: ApiTokenNode,
  sitesConnectionsService: SitesConnectionsService,
  devicesOnSiteService: DevicesOnSiteService,
  activeDeviceService: ActiveDeviceService,
) => {
  try {
    const extState = ExtState.getInstance();
    const { site } = node.parentNode;
    const apiToken = await SettingsAskForApiTokenTask.run(SiteType.Gateway);
    await extState.storeGatewayApiToken(site, apiToken);
    await sitesConnectionsService.disconnectById(site.id);
    await sitesConnect(node.parentNode, sitesConnectionsService, devicesOnSiteService, activeDeviceService);
  } catch (e) {
    if (e instanceof vscode.CancellationError) {
      return;
    }

    Logger.log(e);
  }
};
