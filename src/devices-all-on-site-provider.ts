import vscode from "vscode";
import { ExtState } from "./ext-state";
import { Device } from "./models/device";
import { ApiClient } from "./api/client";
import { DeviceStatusIcon, StringIcon } from "./ui/icons";
import { DevicesFetchSiteDevicesTask } from "./tasks/devices-fetch-site-devices-task";

export class RemoteDeviceNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(device.name, collapsibleState);
    this.contextValue = "enapter.viewItems.Device";
    this.iconPath = new DeviceStatusIcon(device);
  }
}

export class PropertyNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    private readonly property: "id" | "connectivity_status",
  ) {
    super(PropertyNode.getLabel(device, property), vscode.TreeItemCollapsibleState.None);
    this.iconPath = new StringIcon();
    this.contextValue = "enapter.viewItems.DeviceProperty";
  }

  static getLabel(device: Device, property: "id" | "connectivity_status"): string {
    let prefix = "";

    switch (property) {
      case "id":
        prefix = "ID: ";
        break;
    }

    return prefix + device[property];
  }

  static isOnline(status?: string) {
    return String(status).toLowerCase() === "online";
  }

  public getPropertyValue(): string {
    let prefix = "";

    switch (this.property) {
      case "id":
        prefix = "ID: ";
        break;
      case "connectivity_status":
        prefix = "Status: ";
        break;
    }

    return prefix + this.device[this.property];
  }
}

type TreeNode = RemoteDeviceNode | PropertyNode;

export class DevicesAllOnSiteProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly state: ExtState;
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    this.state = ExtState.getInstance();
    this.state.onDidChangeDevices(this.refresh.bind(this));
    this.state.onDidActivateSite(this.refresh.bind(this));
    this.state.onDidDisconnectAllSites(this.refresh.bind(this));
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
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
      const { devices } = await DevicesFetchSiteDevicesTask.run(activeSite);

      return Promise.resolve(
        devices.map((d) => {
          d.site = activeSite;
          return new RemoteDeviceNode(d, vscode.TreeItemCollapsibleState.Collapsed);
        }),
      );
    }

    return Promise.resolve([new PropertyNode(element.device, "id")]);
  }
}
