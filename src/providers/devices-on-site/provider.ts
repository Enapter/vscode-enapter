import vscode from "vscode";
import { PropertyNode } from "../shared-nodes/property-node";
import { ExtState } from "../../ext-state";
import { ApiClient } from "../../api/client";
import { DeviceOnSiteNode } from "./nodes/device-on-site-node";
import { ActiveDeviceService } from "../../services/active-device-service";
import { DevicesOnSiteService } from "../../services/devices-on-site-service";
import { Logger } from "../../logger";

type TreeNode = DeviceOnSiteNode | PropertyNode;

export class DevicesAllOnSiteProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
  private disposables: Array<vscode.Disposable> = [];

  private readonly state: ExtState;
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

  constructor(
    private readonly devicesOnSiteService: DevicesOnSiteService,
    private readonly activeDeviceService: ActiveDeviceService,
  ) {
    this.disposables.push(this.devicesOnSiteService.onDidChangeDevices(() => this.refresh(undefined)));
    this.state = ExtState.getInstance();
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
    Logger.log("Updating");
    const activeSite = this.state.getActiveSite();

    if (!activeSite) {
      return [];
    }

    const apiClient = await ApiClient.forSite(activeSite);

    if (!apiClient) {
      return [];
    }

    if (!element) {
      const activeDevice = this.activeDeviceService.getDevice();
      const devices = this.devicesOnSiteService.getAll();

      return Promise.resolve(
        devices.map((d) => {
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

  dispose() {
    vscode.Disposable.from(...this.disposables).dispose();
  }
}
