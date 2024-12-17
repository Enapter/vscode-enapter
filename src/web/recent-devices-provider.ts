import vscode from "vscode";
import { ExtState } from "./ext-state";

class RecentDevicesTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: RecentDevicesTreeItem[],
  ) {
    super(label, collapsibleState);
  }
}

export class RecentDevicesProvider implements vscode.TreeDataProvider<RecentDevicesTreeItem> {
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

  getTreeItem(element: RecentDevicesTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RecentDevicesTreeItem): Promise<RecentDevicesTreeItem[]> {
    return Promise.resolve(
      this.state.getRecentDevices().map((d) => {
        return new RecentDevicesTreeItem(d, vscode.TreeItemCollapsibleState.None);
      }),
    );
  }
}
