import vscode from "vscode";
import { ExtState } from "./ext-state";
import { Device } from "./models/device";
import { ApiClient } from "./api/client";

class GreenColor extends vscode.ThemeColor {
  constructor() {
    super("enapter.colors.green");
  }
}
class LightGrayColor extends vscode.ThemeColor {
  constructor() {
    super("enapter.colors.Devices.OfflineIndicator");
  }
}

class TextFieldIcon extends vscode.ThemeIcon {
  constructor() {
    super("symbol-string");
  }
}

class OnlineIcon extends vscode.ThemeIcon {
  constructor() {
    super("circle-filled", new GreenColor());
  }
}

class OfflineIcon extends vscode.ThemeIcon {
  constructor() {
    super("circle-filled", new LightGrayColor());
  }
}

function getStatusIcon(status?: string) {
  return String(status).toLowerCase() === "online" ? new OnlineIcon() : new OfflineIcon();
}

export class RemoteDeviceNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(device.name, collapsibleState);
    this.contextValue = "enapter.viewItems.Device";
    this.iconPath = getStatusIcon(device.connectivity_status);
  }
}

export class PropertyNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    private readonly property: "id" | "connectivity_status",
  ) {
    super(PropertyNode.getLabel(device, property), vscode.TreeItemCollapsibleState.None);
    // this.iconPath = new TextFieldIcon();
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

export class DevicesAllOnRemoteProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly api: ApiClient;
  private readonly state: ExtState;
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
    this.state = new ExtState(context);
    this.state.onDidChangeDevices(() => this.refresh());
    this.api = new ApiClient();
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<Array<TreeNode>> {
    if (!element) {
      const devices = await this.api.getDevicesSupportBlueprints();

      return Promise.resolve(devices.map((d) => new RemoteDeviceNode(d, vscode.TreeItemCollapsibleState.Expanded)));
    }

    return Promise.resolve([
      new PropertyNode(element.device, "connectivity_status"),
      new PropertyNode(element.device, "id"),
    ]);
  }
}
