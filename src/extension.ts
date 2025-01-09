import * as vscode from "vscode";
import { RecentDevicesProvider } from "./recent-devices-provider";
import { CommandIDs } from "./constants/commands";
import { ViewIDs } from "./constants/views";
import { Logger } from "./logger";
import { ExtContext } from "./ext-context";
import { selectDevice } from "./commands/select-device";
import { uploadBlueprintToActiveDevice } from "./commands/upload-blueprint-to-active-device";
import { removeRecentDeviceNode } from "./commands/remove-recent-device-node";
import { resetActiveDevice } from "./commands/reset-active-device";
import { ActiveDeviceWebview } from "./active-device-webview";
import { selectRecentAsActiveByTreeNode } from "./commands/select-recent-as-active-by-tree-node";
import { reloadActiveDevice } from "./commands/reload-active-device";
import { ExtSettings } from "./ext-settings";
import { ContextKeys } from "./constants/context-keys";
import { checkConnection } from "./commands/check-connection";

function registerCommand(...args: Parameters<typeof vscode.commands.registerCommand>) {
  return vscode.commands.registerCommand(...args);
}

class Activator {
  constructor(private readonly context: vscode.ExtensionContext) {}

  createTreeView(...args: Parameters<typeof vscode.window.createTreeView>) {
    this.pushToSubscriptions(vscode.window.createTreeView(...args));
  }

  registerWebview(...args: Parameters<typeof vscode.window.registerWebviewViewProvider>) {
    this.pushToSubscriptions(vscode.window.registerWebviewViewProvider(...args));
  }

  private pushToSubscriptions(subscription: vscode.Disposable) {
    this.context.subscriptions.push(subscription);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const activator = new Activator(context);
  const extContext = new ExtContext(context);
  const extSettings = new ExtSettings();

  const logger = new Logger();
  logger.addLogger(console);

  registerCommand(CommandIDs.Setup.SetEnapterCloudConnectionType, () => {
    vscode.commands.executeCommand("setContext", ContextKeys.ConnectionType, "cloud");
  });

  registerCommand(CommandIDs.Setup.SetEnapterGatewayConnectionType, () => {
    vscode.commands.executeCommand("setContext", ContextKeys.ConnectionType, "gateway");
  });

  registerCommand(CommandIDs.Setup.SetApiHost, () => {
    vscode.commands.executeCommand("workbench.action.openSettings", "Enapter");
  });

  registerCommand(CommandIDs.Setup.SetApiKey, () => {
    vscode.commands.executeCommand("workbench.action.openSettings", "Enapter");
  });

  registerCommand(CommandIDs.Setup.CheckConnection, checkConnection);
  registerCommand(CommandIDs.Blueprints.UploadToActiveDevice, uploadBlueprintToActiveDevice);
  registerCommand(CommandIDs.Devices.SelectActive, selectDevice);
  registerCommand(CommandIDs.Devices.ReloadActive, reloadActiveDevice);
  registerCommand(CommandIDs.Devices.ResetActive, resetActiveDevice);
  registerCommand(CommandIDs.Devices.RemoveRecentByTreeNode, removeRecentDeviceNode);
  registerCommand(CommandIDs.Devices.SelectRecentAsActiveByTreeNode, selectRecentAsActiveByTreeNode);

  activator.createTreeView(ViewIDs.Devices.Recent, { treeDataProvider: new RecentDevicesProvider(context) });
  activator.registerWebview(ViewIDs.Devices.Active, new ActiveDeviceWebview(context));
}

export function deactivate() {}
