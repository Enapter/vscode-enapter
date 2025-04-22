import vscode from "vscode";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { SiteType } from "../models/sites/site";
import { ExtState } from "../ext-state";
import { SiteFactory } from "../models/sites/site-factory";
import { SitesFetchSitesAndPickSite } from "../tasks/sites-fetch-sites-and-pick-site";
import { Logger } from "../logger";

export const sitesConnectToCloudSite = async () => {
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

    await extState.storeSite(site);
    const activeSite = extState.getActiveSite();

    if (!activeSite) {
      await extState.activateSite(site);
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
