import vscode from "vscode";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { SitesAskForGatewayAddress } from "../tasks/sites-ask-for-gateway-address";
import { ExtState } from "../ext-state";
import { Site, SiteType } from "../models/sites/site";
import { SiteFactory } from "../models/sites/site-factory";
import { Logger } from "../logger";
import { SitesFetchGatewaySiteTask } from "../tasks/sites-fetch-gateway-site-task";
import { SitesConnectionsService } from "../services/sites-connections-service";

export const sitesConnectToGatewaySite = async (service: SitesConnectionsService): Promise<Site | undefined> => {
  try {
    const extState = ExtState.getInstance();
    const address = await SitesAskForGatewayAddress.run();
    const apiToken = await SettingsAskForApiTokenTask.run(SiteType.Gateway);

    const response = await SitesFetchGatewaySiteTask.run(address, apiToken);

    if (!response) {
      return;
    }

    const site = SiteFactory.createGatewaySite(response.site.id, response.site.name, address);
    await extState.storeGatewayApiToken(site, apiToken);
    await service.add(site);
    const activeSite = service.getActive();

    if (!activeSite) {
      await service.connectById(site.id);
    }

    return site;
  } catch (e) {
    if (e instanceof vscode.CancellationError) {
      console.log("User cancelled the operation.");
    }

    Logger.log(e);
  }
};
