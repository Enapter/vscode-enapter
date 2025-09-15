import vscode from "vscode";
import { DeviceOnSiteNode } from "./nodes/device-on-site-node";
import { DevicesOnSiteService } from "../../services/devices-on-site-service";

export class DevicesAllOnSiteProvider implements vscode.TreeDataProvider<vscode.TreeItem>, vscode.Disposable {
  private disposables: Array<vscode.Disposable> = [];

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> =
    new vscode.EventEmitter<vscode.TreeItem>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

  constructor(private readonly devicesOnSiteService: DevicesOnSiteService) {
    this.disposables.push(this.devicesOnSiteService.onDidChangeDevices(() => this.refresh(undefined)));
  }

  refresh(node: vscode.TreeItem | undefined) {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<Array<vscode.TreeItem>> {
    if (!element) {
      const devices = this.devicesOnSiteService.getAll();

      return Promise.resolve(devices.map((d) => new DeviceOnSiteNode(d, vscode.TreeItemCollapsibleState.Collapsed)));
    }

    if ("getChildren" in element && typeof element.getChildren === "function") {
      return element.getChildren();
    }

    return [];
  }

  dispose() {
    vscode.Disposable.from(...this.disposables).dispose();
  }
}
