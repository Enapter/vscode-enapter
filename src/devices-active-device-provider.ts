import vscode from "vscode";
import { ExtState } from "./ext-state";
import { OfflineIcon, OnlineIcon, PlayIcon, StringIcon } from "./ui/icons";
import { Device } from "./models/device";
import { CommandIDs } from "./constants/commands";

export class PropertyNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly value: string,
    public readonly iconPath = new StringIcon(),
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "enapter.viewItems.DeviceProperty";
  }

  getPropertyValue() {
    return this.value;
  }
}

class UploadBlueprintCommandNode extends vscode.TreeItem {
  iconPath = new PlayIcon();

  command = {
    title: "Upload Blueprint",
    command: CommandIDs.Devices.UploadBlueprint,
    arguments: [this.device],
  } satisfies vscode.Command;

  constructor(public readonly device: Device) {
    super("Upload Blueprint");
  }
}

class CommandsNode extends vscode.TreeItem {
  public readonly value: string = "";

  constructor(public readonly device: Device) {
    super("Commands", vscode.TreeItemCollapsibleState.Expanded);
  }

  getChildren() {
    return [new UploadBlueprintCommandNode(this.device)];
  }

  getPropertyValue() {
    return this.value;
  }
}

type TreeNode = PropertyNode | CommandsNode | UploadBlueprintCommandNode;

export class DevicesActiveDeviceProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly state: ExtState;

  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    this.state = ExtState.getInstance();
    this.state.onDidChangeDevices(this.refresh.bind(this));
    this.state.onDidChangeActiveDevice(this.refresh.bind(this));
    this.state.onDidActivateSite(this.refresh.bind(this));
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<Array<TreeNode>> {
    const device = this.state.getActiveDevice();
    const site = this.state.getActiveSite();

    if (!device || !site) {
      return [];
    }

    if (!element) {
      const isOnline = String(device.connectivity_status).toLowerCase() === "online";

      return [
        new PropertyNode(isOnline ? "Online" : "Offline", device.name, isOnline ? new OnlineIcon() : new OfflineIcon()),
        new PropertyNode(`Name: ${device.name}`, device.name),
        new PropertyNode(`ID: ${device.id}`, device.id),
        new CommandsNode(device),
      ];
    }

    if ("getChildren" in element && typeof element.getChildren === "function") {
      return element.getChildren();
    }

    return [];
  }
}
