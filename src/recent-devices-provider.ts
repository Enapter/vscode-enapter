import vscode, { ThemeIcon } from "vscode";
import { ExtState } from "./ext-state";
import { Device } from "./models/device";

class TextFieldIcon extends ThemeIcon {
  constructor() {
    super("symbol-string");
  }
}

export class RecentDevicesTreeItem extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: RecentDevicesTreeItem[],
  ) {
    super(device.name, collapsibleState);
    this.contextValue = "enapter.viewItems.Device";
  }
}

export class DeviceTreeItemProperty extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    private readonly property: string,
  ) {
    super(DeviceTreeItemProperty.getLabel(device, property), vscode.TreeItemCollapsibleState.None);
    this.iconPath = new TextFieldIcon();
    this.contextValue = "enapter.viewItems.DeviceProperty";
  }

  static getLabel(device: Device, property: string): string {
    const key = String(property).toLowerCase();

    return `${property}: ${String(device[key as keyof Device])}`;
  }

  public getPropertyValue(): string {
    const key = String(this.property).toLowerCase();

    return String(this.device[key as keyof Device]);
  }
}

export class RecentDevicesProvider implements vscode.TreeDataProvider<RecentDevicesTreeItem | DeviceTreeItemProperty> {
  private readonly state: ExtState;
  private _onDidChangeTreeData: vscode.EventEmitter<RecentDevicesTreeItem | undefined> = new vscode.EventEmitter<
    RecentDevicesTreeItem | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<RecentDevicesTreeItem | undefined> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
    this.state = new ExtState(context);
    this.state.onDidChangeDevices(() => this.refresh());
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: RecentDevicesTreeItem | DeviceTreeItemProperty): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: RecentDevicesTreeItem | DeviceTreeItemProperty,
  ): Promise<Array<RecentDevicesTreeItem | DeviceTreeItemProperty>> {
    if (!element) {
      return Promise.resolve(
        this.state.getRecentDevices().map((d) => {
          return new RecentDevicesTreeItem(d, vscode.TreeItemCollapsibleState.Expanded);
        }),
      );
    }

    return Promise.resolve([new DeviceTreeItemProperty(element.device, "ID")]);
  }
}
