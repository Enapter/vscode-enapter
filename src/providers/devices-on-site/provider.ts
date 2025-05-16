import vscode from "vscode";
import { Device, sortByActiveDevice, sortByOnlineStatus } from "../../models/device";
import { PropertyNode } from "../shared-nodes/property-node";
import { ExtState } from "../../ext-state";
import { ApiClient } from "../../api/client";
import { DevicesFetchSiteDevicesTask } from "../../tasks/devices-fetch-site-devices-task";
import { DeviceOnSiteNode } from "./nodes/device-on-site-node";

type TreeNode = DeviceOnSiteNode | PropertyNode;

export class DevicesAllOnSiteProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly state: ExtState;
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    this.state = ExtState.getInstance();
    this.state.onDidChangeDevices(() => this.refresh(undefined));
    this.state.onDidChangeActiveDevice(() => this.refresh(undefined));
    this.state.onDidActivateSite(() => this.refresh(undefined));
    this.state.onDidDisconnectAllSites(() => this.refresh(undefined));
    this.state.onDidDisconnectFromActiveSite(() => this.refresh(undefined));
  }

  refresh(node: TreeNode | undefined) {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<Array<TreeNode>> {
    const activeSite = this.state.getActiveSite();

    if (!activeSite) {
      return [];
    }

    const apiClient = await ApiClient.forSite(activeSite);

    if (!apiClient) {
      return [];
    }

    if (!element) {
      const activeDevice = this.state.getActiveDevice();
      let devices: Device[] = [];

      try {
        const response = await DevicesFetchSiteDevicesTask.run(activeSite);

        if (response) {
          devices = response.devices;
        }
      } catch (_) {
        await this.state.disconnectFromActiveSite();
        await this.state.clearActiveDevice();
      }

      if (!devices.length || (!!activeDevice && !devices.some((d) => d.id === activeDevice.id))) {
        await this.state.clearActiveDevice();
      }

      return Promise.resolve(
        devices
          .sort(sortByOnlineStatus)
          .sort((d) => sortByActiveDevice(d, activeDevice))
          .map((d) => {
            const isActive = !!activeDevice && d.id === activeDevice?.id;
            d.site = activeSite;
            return new DeviceOnSiteNode(d, isActive, vscode.TreeItemCollapsibleState.Collapsed);
          }),
      );
    }

    if ("getChildren" in element) {
      return element.getChildren();
    }

    return [];
  }
}
