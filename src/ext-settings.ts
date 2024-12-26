import vscode from "vscode";

export class ExtSettings {
  static instance: ExtSettings;

  constructor() {
    if (ExtSettings.instance) {
      return ExtSettings.instance;
    }

    ExtSettings.instance = this;
  }

  get apiKey(): string {
    return vscode.workspace.getConfiguration("enapter").get("apiKey") || "";
  }

  get apiHost(): string {
    return vscode.workspace.getConfiguration("enapter").get("apiHost") || "";
  }
}
