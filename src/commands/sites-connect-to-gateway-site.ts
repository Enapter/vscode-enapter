import vscode from "vscode";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { SitesAskForGatewayAddress } from "../tasks/sites-ask-for-gateway-address";
import { ExtState } from "../ext-state";
import { SiteType } from "../models/sites/site";
import { SiteFactory } from "../models/sites/site-factory";
import { SitesGetGatewaySiteInfoTask } from "../tasks/sites-get-gateway-site-info-task";
import { ApiClient } from "../api/client";

export const sitesConnectToGatewaySite = async () => {
  try {
    const extState = ExtState.getInstance();
    const address = await SitesAskForGatewayAddress.run();
    const apiToken = await SettingsAskForApiTokenTask.run(SiteType.Gateway);
    const apiClient = ApiClient.forGateway(address, apiToken);

    const {
      site: { id, name },
    } = await SitesGetGatewaySiteInfoTask.run(apiClient);

    const site = SiteFactory.createGatewaySite(id, name, address);
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
  }
};
