import vscode from "vscode";
import { SiteType } from "../models/sites/site";

const prompts = {
  [SiteType.Cloud]: "Enapter Cloud API Token",
  [SiteType.Gateway]: "Enapter Gateway API Token",
};

const placeholders = {
  [SiteType.Cloud]: "Enter your Enapter Cloud API Token",
  [SiteType.Gateway]: "Enter your Enapter Gateway API Token",
};

const validateInput = (value: string) => {
  if (!value) {
    return "API token is required";
  }

  return null;
};

export class SettingsAskForApiTokenTask {
  constructor() {}

  static async run(siteType: SiteType, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SettingsAskForApiTokenTask().run(siteType);
  }

  async run(siteType: SiteType) {
    const apiToken = await vscode.window.showInputBox({
      prompt: prompts[siteType],
      placeHolder: placeholders[siteType],
      ignoreFocusOut: true,
      validateInput,
    });

    if (!apiToken) {
      throw new vscode.CancellationError();
    }

    return apiToken;
  }
}
