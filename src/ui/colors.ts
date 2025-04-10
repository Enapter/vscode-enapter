import vscode from "vscode";

export class GreenColor extends vscode.ThemeColor {
  constructor() {
    super("enapter.colors.green");
  }
}

export class OfflineIndicatorColor extends vscode.ThemeColor {
  constructor() {
    super("enapter.colors.Devices.OfflineIndicator");
  }
}
