import * as vscode from "vscode";
import { CommandIDs } from "./constants/commands";
import { ViewIDs } from "./constants/views";
import { Logger } from "./logger";
import { ExtContext } from "./ext-context";
import { uploadActiveEditorManifest } from "./commands/upload-active-editor-manifest";
import { reloadActiveDevice } from "./commands/reload-active-device";
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
import { sitesConnectToGatewaySite } from "./commands/sites-connect-to-gateway-site";
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
import { ActiveDeviceService } from "./services/active-device-service";
import { ActiveDeviceStorage } from "./storages/active-device-storage";
import { DeviceOnSiteNode } from "./providers/devices-on-site/nodes/device-on-site-node";
import { DevicesOnSiteStorage } from "./storages/devices-on-site-storage";
import { DevicesOnSiteService } from "./services/devices-on-site-service";
import { GatewayNode } from "./providers/sites-connections/nodes/gateway-node";
import { SitesConnectionsStorage } from "./storages/sites-connections-storage";
import { SitesConnectionsService } from "./services/sites-connections-service";
import { sitesEditAddress } from "./commands/sites-edit-address";
import { sitesReloadDevices } from "./commands/sites-reload-devices";
import { ActiveDevicePollingService } from "./services/active-device-polling-service";
import { DevicesOnSitePollingService } from "./services/devices-on-site-polling-service";
import { devicesOpenInBrowser } from "./commands/devices-open-in-browser";
import { Device } from "./models/device";
import { devicesDelete } from "./commands/devices-delete";

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

export async function activate(context: vscode.ExtensionContext) {
  const activator = new Activator(context);
  const extContext = new ExtContext(context);
  new ExtState(extContext.context);

  const logger = new Logger();
  logger.addLogger(console);

  const activeDeviceStorage = new ActiveDeviceStorage(context.globalState);
  const activeDeviceService = new ActiveDeviceService(activeDeviceStorage);

  const devicesOnSiteStorage = new DevicesOnSiteStorage(context.globalState);
  const devicesOnSiteService = new DevicesOnSiteService(devicesOnSiteStorage, activeDeviceService);

  const sitesConnectionsStorage = new SitesConnectionsStorage(context.globalState);
  const sitesConnectionsService = new SitesConnectionsService(sitesConnectionsStorage);

  try {
    const activeSite = sitesConnectionsService.getActive();

    if (activeSite) {
      await sitesConnectionsService.disconnectById(activeSite.id);
    }

    await devicesOnSiteService.replaceAll([]);
    await activeDeviceService.replaceDevice(undefined);
  } catch (e) {
    logger.log("Error while disconnecting from active site on extension activation", e);
  }

  const activeDevicePollingService = new ActiveDevicePollingService(activeDeviceService);
  context.subscriptions.push(activeDevicePollingService);
  activeDevicePollingService.start();

  const devicesOnSitePollingService = new DevicesOnSitePollingService(
    sitesConnectionsService,
    devicesOnSiteService,
    activeDeviceService,
  );
  context.subscriptions.push(devicesOnSitePollingService);
  devicesOnSitePollingService.start();

  const logsChannel = new DeviceLogsChannel(activeDeviceService);
  context.subscriptions.push(logsChannel);
  vscode.commands.executeCommand("setContext", "enapter.context.Devices.IsLogging", false);

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("enbp", new EnbpFileSystemProvider(), {
      isCaseSensitive: true,
    }),
  );

  vscode.workspace.registerTextDocumentContentProvider("enbp-content-file", new EnbpContentFileProvider());

  registerCommand(CommandIDs.Blueprints.UploadActiveEditorManifest, () => {
    return uploadActiveEditorManifest(activeDeviceService);
  });
  registerCommand(CommandIDs.Devices.Connect, (node: DeviceOnSiteNode) => {
    return devicesConnect(node, devicesOnSiteService);
  });
  registerCommand(CommandIDs.Devices.Disconnect, (node: DeviceOnSiteNode) => {
    return devicesDisconnect(node.device, devicesOnSiteService);
  });
  registerCommand(CommandIDs.Devices.ReloadActive, () => {
    return reloadActiveDevice(activeDeviceService, sitesConnectionsService);
  });
  registerCommand(CommandIDs.Devices.Active.Disconnect, () => {
    const device = activeDeviceService.getDevice();
    if (!device) return;
    return devicesDisconnect(device, devicesOnSiteService);
  });
  registerCommand(CommandIDs.Devices.UploadBlueprint, (node: DeviceOnSiteNode) => {
    return devicesUploadBlueprint(node.device, sitesConnectionsService);
  });
  registerCommand(CommandIDs.Devices.StreamLogs, devicesStreamLogs);
  registerCommand(CommandIDs.Devices.StopLogs, devicesStopLogs);
  registerCommand(CommandIDs.Devices.OpenInBrowser, (node?: DeviceOnSiteNode) => {
    const device = node?.device || activeDeviceService.getDevice();

    if (!device) {
      return;
    }

    return devicesOpenInBrowser(device);
  });
  registerCommand(CommandIDs.Devices.Delete, (device: Device) => {
    return devicesDelete(device, sitesConnectionsService, activeDeviceService, devicesOnSiteService);
  });
  registerCommand(CommandIDs.Sites.ReloadDevices, () => {
    return sitesReloadDevices(sitesConnectionsService, devicesOnSiteService);
  });

  registerCommand(CommandIDs.Sites.ConnectToNew, () => {
    return sitesConnectToNew(sitesConnectionsService, devicesOnSiteService);
  });
  registerCommand(CommandIDs.Sites.ConnectToGatewaySite, () => {
    return sitesConnectToGatewaySite(sitesConnectionsService);
  });
  registerCommand(CommandIDs.Sites.Connect, (node: GatewayNode) => {
    return sitesConnect(node, sitesConnectionsService, devicesOnSiteService, activeDeviceService);
  });
  registerCommand(CommandIDs.Sites.Disconnect, (node: GatewayNode) => {
    return sitesDisconnect(node, sitesConnectionsService, devicesOnSiteService, activeDeviceService);
  });
  registerCommand(CommandIDs.Sites.Remove, (node: GatewayNode) => {
    return sitesRemove(node, sitesConnectionsService, devicesOnSiteService, activeDeviceService);
  });
  registerCommand(CommandIDs.Sites.RemoveAll, () => {
    return sitesRemoveAll(sitesConnectionsService);
  });
  registerCommand(CommandIDs.Sites.CopyApiToken, sitesCopyApiToken);
  registerCommand(CommandIDs.Sites.EditAddress, (node: GatewayNode) => {
    return sitesEditAddress(node.site.id, sitesConnectionsService);
  });

  registerCommand(CommandIDs.Enbp.Mount, mountEnbp);
  registerCommand(CommandIDs.Enbp.OpenTreeItem, openEnbpTreeItem);

  registerCommand(CommandIDs.Common.CopyProperty, copyPropertyNodeValue);

  registerCommand(CommandIDs.Channels.DeviceLogs.Reveal, channelsDeviceLogsChannelReveal);

  activator.createTreeView(ViewIDs.Sites.All, {
    treeDataProvider: new SitesConnectionsProvider(sitesConnectionsService),
    showCollapseAll: true,
  });

  activator.createTreeView(ViewIDs.Devices.AllOnRemote, {
    treeDataProvider: new DevicesAllOnSiteProvider(devicesOnSiteService),
    showCollapseAll: true,
  });

  activator.createTreeView(ViewIDs.Devices.Active, {
    treeDataProvider: new ActiveDeviceProvider(activeDeviceService),
  });

  return Promise.resolve({
    context,
  });
}

export function deactivate() {}
