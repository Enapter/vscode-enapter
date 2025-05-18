import vscode from "vscode";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { SiteType } from "../models/sites/site";
import { ExtState } from "../ext-state";
import { SiteFactory } from "../models/sites/site-factory";
import { SitesFetchSitesAndPickSite } from "../tasks/sites-fetch-sites-and-pick-site";
import { Logger } from "../logger";
import { SitesConnectionsService } from "../services/sites-connections-service";

export const sitesConnectToCloudSite = async (service: SitesConnectionsService) => {
  const onCancelCallbacks = [];

  try {
    const extState = ExtState.getInstance();

    const selected = await SitesFetchSitesAndPickSite.run();

    if (!selected) {
      throw new vscode.CancellationError();
    }

    const { id, name } = selected;
    const site = SiteFactory.createCloudSite(id, name);

    let apiToken = await extState.getCloudApiToken();

    if (!apiToken) {
      apiToken = await SettingsAskForApiTokenTask.run(SiteType.Cloud);
      await extState.storeCloudApiToken(apiToken);

      onCancelCallbacks.push(() => {
        extState.deleteCloudApiToken();
      });
    }

    await service.add(site);
    const activeSite = service.getActive();

    if (!activeSite) {
      await service.connectById(site.id);
    }
  } catch (e) {
    if (onCancelCallbacks.length > 0) {
      onCancelCallbacks.reverse().forEach((callback) => callback());
    }

    if (!(e instanceof vscode.CancellationError)) {
      Logger.log(e);
    }
  }
};
