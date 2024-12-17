import vscode from "vscode";

export class ExtSettings {
  constructor() {}

  get apiKey(): string {
    return vscode.workspace.getConfiguration("enapter").get("apiKey") || "";
  }

  get apiHost(): string {
    return vscode.workspace.getConfiguration("enapter").get("apiHost") || "";
  }
}
