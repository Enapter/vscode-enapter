import vscode from "vscode";
import { ExtState } from "../ext-state";
import { SettingsAskForApiTokenTask } from "../tasks/settings-ask-for-api-token-task";
import { SiteType } from "../models/sites/site";

export const sitesSetCloudApiToken = async () => {
  const onCancelCallbacks = [];

  try {
    const extState = ExtState.getInstance();
    const apiToken = await SettingsAskForApiTokenTask.run(SiteType.Cloud);
    await extState.storeCloudApiToken(apiToken);

    onCancelCallbacks.push(() => {
      extState.deleteCloudApiToken();
    });

    return true;
  } catch (e) {
    if (onCancelCallbacks.length > 0) {
      onCancelCallbacks.reverse().forEach((callback) => callback());
    }

    if (e instanceof vscode.CancellationError) {
      console.log("User cancelled the operation.");
    }
  }
};
