import vscode from "vscode";
import { SiteType } from "../models/sites/site";

const prompts = {
  [SiteType.Cloud]: "Enter the name of the site",
  [SiteType.Gateway]: "Enter the name of the gateway",
};

const validateInput = (value: string) => {
  if (!value) {
    return "Name cannot be empty";
  }

  return null;
};

export class SitesAskForSiteName {
  constructor() {}

  static async run(siteType: SiteType, token?: vscode.CancellationToken | undefined) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesAskForSiteName().run(siteType);
  }

  async run(siteType: SiteType) {
    const name = await vscode.window.showInputBox({
      prompt: prompts[siteType],
      ignoreFocusOut: true,
      validateInput,
    });

    if (!name) {
      throw new vscode.CancellationError();
    }

    return name;
  }
}
