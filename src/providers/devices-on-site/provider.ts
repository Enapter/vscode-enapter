import vscode from "vscode";
import { PropertyNode } from "../shared-nodes/property-node";
import { DeviceOnSiteNode } from "./nodes/device-on-site-node";
import { DevicesOnSiteService } from "../../services/devices-on-site-service";

type TreeNode = DeviceOnSiteNode | PropertyNode;

export class DevicesAllOnSiteProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
  private disposables: Array<vscode.Disposable> = [];

  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

  constructor(private readonly devicesOnSiteService: DevicesOnSiteService) {
    this.disposables.push(this.devicesOnSiteService.onDidChangeDevices(() => this.refresh(undefined)));
  }

  refresh(node: TreeNode | undefined) {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<Array<TreeNode>> {
    if (!element) {
      const devices = this.devicesOnSiteService.getAll();

      return Promise.resolve(devices.map((d) => new DeviceOnSiteNode(d, vscode.TreeItemCollapsibleState.Collapsed)));
    }

    if ("getChildren" in element) {
      return element.getChildren();
    }

    return [];
  }

  dispose() {
    vscode.Disposable.from(...this.disposables).dispose();
  }
}
