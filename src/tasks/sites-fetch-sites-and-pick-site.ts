import vscode from "vscode";
import { ApiClient, SiteResponse } from "../api/client";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { SettingsAskForApiTokenTask } from "./settings-ask-for-api-token-task";
import { SiteType } from "../models/sites/site";

class SiteQuickPickItem implements vscode.QuickPickItem {
  public label: string;
  public detail: string;

  constructor(public site: SiteResponse) {
    this.label = this.site.name;
    this.detail = this.site.id;
  }
}

export class SitesFetchSitesAndPickSite {
  constructor() {}

  static async run(token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesFetchSitesAndPickSite().run();
  }

  async run() {
    let abortController = new AbortController();
    const disposables: vscode.Disposable[] = [];
    const extState = ExtState.getInstance();
    let apiToken = await extState.getCloudApiToken();

    if (!apiToken) {
      Logger.error("No API token found");
      apiToken = await SettingsAskForApiTokenTask.run(SiteType.Cloud);
    }

    try {
      return await new Promise<SiteResponse | undefined>((resolve) => {
        const quickPick = vscode.window.createQuickPick<SiteQuickPickItem>();
        quickPick.title = "Select a site";
        quickPick.busy = true;

        disposables.push(
          quickPick.onDidChangeSelection((selections) => {
            resolve(selections[0].site);
            quickPick.hide();
          }),
        );

        disposables.push(
          quickPick.onDidHide(() => {
            resolve(undefined);
            quickPick.dispose();
          }),
        );

        const setQuickPickItems = (name: string) => {
          quickPick.items = [];
          abortController.abort();
          abortController = new AbortController();
          quickPick.busy = true;

          ApiClient.forCloud(apiToken)
            .getAllSites(name, abortController)
            .then((sitesResponse) => {
              quickPick.items = sitesResponse.sites.map((s) => new SiteQuickPickItem(s));
            })
            .catch((e) => {
              if (e.name === "AbortError") {
                return;
              }

              Logger.error(`Error fetching sites: ${e}`);
            })
            .finally(() => {
              quickPick.busy = false;
            });
        };

        disposables.push(quickPick.onDidChangeValue(setQuickPickItems));
        setQuickPickItems(quickPick.value);
        quickPick.show();
      });
    } finally {
      disposables.forEach((d) => d.dispose());
      abortController.abort();
    }
  }
}
