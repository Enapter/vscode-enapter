import * as vscode from "vscode";
import { CommandIDs } from "./constants/commands";
import { ViewIDs } from "./constants/views";
import { Logger } from "./logger";
import { ExtContext } from "./ext-context";
import { uploadBlueprintToActiveDevice } from "./commands/upload-blueprint-to-active-device";
import { uploadActiveEditorManifest } from "./commands/upload-active-editor-manifest";
import { resetActiveDevice } from "./commands/reset-active-device";
import { reloadActiveDevice } from "./commands/reload-active-device";
import { ExtSettings } from "./ext-settings";
import { mountEnbp } from "./commands/mount-enbp";
import { EnbpFileSystemProvider } from "./enbp-file-system-provider";
import { openEnbpTreeItem } from "./commands/open-enbp-tree-item";
import { EnbpContentFileProvider } from "./enbp-content-file-provider";
import { copyPropertyNodeValue } from "./commands/copy-property-node-value";
import { sitesConnectToNew } from "./commands/sites-connect-to-new";
import { sitesDisconnect } from "./commands/sites-disconnect";
import { sitesConnect } from "./commands/sites-connect";
import { sitesCopyApiToken } from "./commands/sites-copy-api-token";
import { ExtState } from "./ext-state";
import { sitesConnectToCloudSite } from "./commands/sites-connect-to-cloud-site";
import { sitesConnectToGatewaySite } from "./commands/sites-connect-to-gateway-site";
import { sitesSetCloudApiToken } from "./commands/sites-set-cloud-api-token";
import { sitesRemoveCloudApiToken } from "./commands/sites-remove-cloud-api-token";
import { devicesUploadBlueprint } from "./commands/devices-upload-blueprint";
import { sitesRemoveAll } from "./commands/sites-remove-all";
import { devicesConnect } from "./commands/devices-connect";
import { devicesStopLogs } from "./commands/devices-stop-logs";
import { DeviceLogsChannel } from "./channels/device-logs-channel";
import { ActiveDeviceProvider } from "./providers/active-device/provider";
import { channelsDeviceLogsChannelReveal } from "./commands/channels-device-logs-channel-reveal";
import { devicesStreamLogs } from "./commands/devices-stream-logs";
import { devicesDisconnect } from "./commands/devices-disconnect";
import { sitesRemove } from "./commands/sites-remove";
import { DevicesAllOnSiteProvider } from "./providers/devices-on-site/provider";
import { SitesConnectionsProvider } from "./providers/sites-connections/provider";

function registerCommand(...args: Parameters<typeof vscode.commands.registerCommand>) {
  return vscode.commands.registerCommand(...args);
}

class Activator {
  constructor(private readonly context: vscode.ExtensionContext) {}

  createTreeView(...args: Parameters<typeof vscode.window.createTreeView>) {
    this.pushToSubscriptions(vscode.window.createTreeView(...args));
  }

  private pushToSubscriptions(subscription: vscode.Disposable) {
    this.context.subscriptions.push(subscription);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const activator = new Activator(context);
  new ExtSettings();
  const extContext = new ExtContext(context);
  new ExtState(extContext.context);

  const logger = new Logger();
  logger.addLogger(console);

  const logsChannel = new DeviceLogsChannel();
  context.subscriptions.push(logsChannel);
  vscode.commands.executeCommand("setContext", "enapter.context.Devices.IsLogging", false);

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("enbp", new EnbpFileSystemProvider(), {
      isCaseSensitive: true,
    }),
  );

  vscode.workspace.registerTextDocumentContentProvider("enbp-content-file", new EnbpContentFileProvider());

  registerCommand(CommandIDs.Blueprints.UploadToActiveDevice, uploadBlueprintToActiveDevice);
  registerCommand(CommandIDs.Blueprints.UploadActiveEditorManifest, uploadActiveEditorManifest);
  registerCommand(CommandIDs.Devices.Connect, devicesConnect);
  registerCommand(CommandIDs.Devices.Disconnect, devicesDisconnect);
  registerCommand(CommandIDs.Devices.ReloadActive, reloadActiveDevice);
  registerCommand(CommandIDs.Devices.ResetActive, resetActiveDevice);
  registerCommand(CommandIDs.Devices.UploadBlueprint, devicesUploadBlueprint);
  registerCommand(CommandIDs.Devices.StreamLogs, devicesStreamLogs);
  registerCommand(CommandIDs.Devices.StopLogs, devicesStopLogs);

  registerCommand(CommandIDs.Sites.ConnectToNew, sitesConnectToNew);
  registerCommand(CommandIDs.Sites.ConnectToCloudSite, sitesConnectToCloudSite);
  registerCommand(CommandIDs.Sites.ConnectToGatewaySite, sitesConnectToGatewaySite);
  registerCommand(CommandIDs.Sites.Connect, sitesConnect);
  registerCommand(CommandIDs.Sites.Disconnect, sitesDisconnect);
  registerCommand(CommandIDs.Sites.Remove, sitesRemove);
  registerCommand(CommandIDs.Sites.RemoveAll, sitesRemoveAll);
  registerCommand(CommandIDs.Sites.RemoveCloudApiToken, sitesRemoveCloudApiToken);
  registerCommand(CommandIDs.Sites.SetCloudApiToken, sitesSetCloudApiToken);
  registerCommand(CommandIDs.Sites.CopyApiToken, sitesCopyApiToken);

  registerCommand(CommandIDs.Enbp.Mount, mountEnbp);
  registerCommand(CommandIDs.Enbp.OpenTreeItem, openEnbpTreeItem);

  registerCommand(CommandIDs.Common.CopyProperty, copyPropertyNodeValue);

  registerCommand(CommandIDs.Channels.DeviceLogs.Reveal, channelsDeviceLogsChannelReveal);

  activator.createTreeView(ViewIDs.Sites.All, {
    treeDataProvider: new SitesConnectionsProvider(),
    showCollapseAll: true,
  });

  activator.createTreeView(ViewIDs.Devices.AllOnRemote, {
    treeDataProvider: new DevicesAllOnSiteProvider(),
    showCollapseAll: true,
  });

  activator.createTreeView(ViewIDs.Devices.Active, {
    treeDataProvider: new ActiveDeviceProvider(),
  });
}

export function deactivate() {}
