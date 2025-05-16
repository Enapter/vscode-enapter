import vscode from "vscode";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { SitesAskForGatewayAddress } from "../tasks/sites-ask-for-gateway-address";
import { ExtState } from "../ext-state";
import { SiteType } from "../models/sites/site";
import { SiteFactory } from "../models/sites/site-factory";
import { Logger } from "../logger";
import { SitesFetchGatewaySiteTask } from "../tasks/sites-fetch-gateway-site-task";

export const sitesConnectToGatewaySite = async () => {
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
    await extState.storeSite(site);
    const activeSite = extState.getActiveSite();

    if (!activeSite) {
      await extState.activateSite(site);
    }
  } catch (e) {
    if (e instanceof vscode.CancellationError) {
      console.log("User cancelled the operation.");
    }

    Logger.log(e);
  }
};
