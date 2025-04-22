import * as vscode from "vscode";
import { CommandIDs } from "./constants/commands";
import { ViewIDs } from "./constants/views";
import { Logger } from "./logger";
import { ExtContext } from "./ext-context";
import { selectDevice } from "./commands/select-device";
import { uploadBlueprintToActiveDevice } from "./commands/upload-blueprint-to-active-device";
import { uploadActiveEditorManifest } from "./commands/upload-active-editor-manifest";
import { removeRecentDeviceNode } from "./commands/remove-recent-device-node";
import { resetActiveDevice } from "./commands/reset-active-device";
import { selectRecentAsActiveByTreeNode } from "./commands/select-recent-as-active-by-tree-node";
import { reloadActiveDevice } from "./commands/reload-active-device";
import { ExtSettings } from "./ext-settings";
import { mountEnbp } from "./commands/mount-enbp";
import { EnbpFileSystemProvider } from "./enbp-file-system-provider";
import { openEnbpTreeItem } from "./commands/open-enbp-tree-item";
import { EnbpContentFileProvider } from "./enbp-content-file-provider";
import { copyDeviceProperty } from "./commands/copy-device-property";
import { DevicesAllOnSiteProvider } from "./devices-all-on-site-provider";
import { SitesProvider } from "./sites-provider";
import { sitesConnectToNew } from "./commands/sites-connect-to-new";
import { sitesDisconnect } from "./commands/sites-disconnect";
import { sitesConnect } from "./commands/sites-connect";
import { sitesCopyApiToken } from "./commands/sites-copy-api-token";
import { ExtState } from "./ext-state";
import { sitesConnectToCloudSite } from "./commands/sites-connect-to-cloud-site";
import { sitesConnectToGatewaySite } from "./commands/sites-connect-to-gateway-site";
import { sitesSetCloudApiToken } from "./commands/sites-set-cloud-api-token";
import { sitesRemoveCloudApiToken } from "./commands/sites-remove-cloud-api-token";
import { DevicesActiveDeviceProvider } from "./devices-active-device-provider";
import { devicesUploadBlueprint } from "./commands/devices-upload-blueprint";
import { sitesDisconnectAll } from "./commands/sites-disconnect-all";

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
  const extSettings = new ExtSettings();
  const extContext = new ExtContext(context);
  new ExtState(extContext.context);

  const logger = new Logger();
  logger.addLogger(console);

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("enbp", new EnbpFileSystemProvider(), {
      isCaseSensitive: true,
    }),
  );

  vscode.workspace.registerTextDocumentContentProvider("enbp-content-file", new EnbpContentFileProvider());

  registerCommand(CommandIDs.Setup.SetEnapterCloudConnectionType, () => {
    void extSettings.setConnectionType("cloud");
  });

  registerCommand(CommandIDs.Setup.SetEnapterGatewayConnectionType, () => {
    void extSettings.setConnectionType("gateway");
  });

  registerCommand(CommandIDs.Setup.SetApiHost, () => {
    vscode.commands.executeCommand("workbench.action.openSettings", "Enapter");
  });

  registerCommand(CommandIDs.Setup.SetApiKey, () => {
    vscode.commands.executeCommand("workbench.action.openSettings", "Enapter");
  });

  registerCommand(CommandIDs.Blueprints.UploadToActiveDevice, uploadBlueprintToActiveDevice);
  registerCommand(CommandIDs.Blueprints.UploadActiveEditorManifest, uploadActiveEditorManifest);
  registerCommand(CommandIDs.Devices.SelectActive, selectDevice);
  registerCommand(CommandIDs.Devices.ReloadActive, reloadActiveDevice);
  registerCommand(CommandIDs.Devices.ResetActive, resetActiveDevice);
  registerCommand(CommandIDs.Devices.RemoveRecentByTreeNode, removeRecentDeviceNode);
  registerCommand(CommandIDs.Devices.SelectRecentAsActiveByTreeNode, selectRecentAsActiveByTreeNode);
  registerCommand(CommandIDs.Devices.CopyProperty, copyDeviceProperty);
  registerCommand(CommandIDs.Devices.UploadBlueprint, devicesUploadBlueprint);

  registerCommand(CommandIDs.Sites.ConnectToNew, sitesConnectToNew);
  registerCommand(CommandIDs.Sites.ConnectToCloudSite, sitesConnectToCloudSite);
  registerCommand(CommandIDs.Sites.ConnectToGatewaySite, sitesConnectToGatewaySite);
  registerCommand(CommandIDs.Sites.Connect, sitesConnect);
  registerCommand(CommandIDs.Sites.Disconnect, sitesDisconnect);
  registerCommand(CommandIDs.Sites.DisconnectAll, sitesDisconnectAll);
  registerCommand(CommandIDs.Sites.RemoveCloudApiToken, sitesRemoveCloudApiToken);
  registerCommand(CommandIDs.Sites.SetCloudApiToken, sitesSetCloudApiToken);
  registerCommand(CommandIDs.Sites.CopyApiToken, sitesCopyApiToken);

  registerCommand(CommandIDs.Enbp.Mount, mountEnbp);
  registerCommand(CommandIDs.Enbp.OpenTreeItem, openEnbpTreeItem);

  activator.createTreeView(ViewIDs.Sites.All, {
    treeDataProvider: new SitesProvider(),
    showCollapseAll: true,
  });

  activator.createTreeView(ViewIDs.Devices.AllOnRemote, {
    treeDataProvider: new DevicesAllOnSiteProvider(),
    showCollapseAll: true,
  });

  activator.createTreeView(ViewIDs.Devices.Active, {
    treeDataProvider: new DevicesActiveDeviceProvider(),
  });
}

export function deactivate() {}
