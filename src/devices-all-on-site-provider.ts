import vscode from "vscode";
import { ExtState } from "./ext-state";
import { Device } from "./models/device";
import { ApiClient } from "./api/client";
import { DeviceStatusIcon, StringIcon } from "./ui/icons";
import { DevicesFetchSiteDevicesTask } from "./tasks/devices-fetch-site-devices-task";

export class RemoteDeviceNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    isActive: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(device.name, collapsibleState);
    this.iconPath = new DeviceStatusIcon(device);
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  setDescription(isActive: boolean) {
    this.description = isActive ? "(Active)" : undefined;
  }

  setContextValue(isActive: boolean) {
    this.contextValue = isActive ? "enapter.viewItems.ConnectedDevice" : "enapter.viewItems.Device";
  }

  getChildren() {
    return [new PropertyNode(this.device, "id"), new PropertyNode(this.device, "slug")];
  }
}

export class PropertyNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    private readonly property: "id" | "connectivity_status" | "slug",
  ) {
    super(PropertyNode.getLabel(device, property), vscode.TreeItemCollapsibleState.None);
    this.iconPath = new StringIcon();
    this.contextValue = "enapter.viewItems.DeviceProperty";
  }

  static getLabel(device: Device, property: "id" | "connectivity_status" | "slug"): string {
    let prefix = "";

    switch (property) {
      case "id":
        prefix = "ID: ";
        break;
      case "connectivity_status":
        prefix = "Status: ";
        break;
      case "slug":
        prefix = "Slug: ";
        break;
    }

    return prefix + device[property];
  }

  static isOnline(status?: string) {
    return String(status).toLowerCase() === "online";
  }
}

type TreeNode = RemoteDeviceNode | PropertyNode;

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
          .sort((d) => {
            if (PropertyNode.isOnline(d.connectivity_status)) {
              return -1;
            }

            return 1;
          })
          .sort((d) => {
            if (d.id === activeDevice?.id) {
              return -1;
            }

            return 0;
          })
          .map((d) => {
            const isActive = !!activeDevice && d.id === activeDevice?.id;
            d.site = activeSite;
            return new RemoteDeviceNode(d, isActive, vscode.TreeItemCollapsibleState.Collapsed);
          }),
      );
    }

    if ("getChildren" in element) {
      return element.getChildren();
    }

    return [];
  }
}
