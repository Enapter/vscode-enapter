import vscode from "vscode";
import { CloudSite } from "../../models/sites/cloud-site";
import { GatewaySite } from "../../models/sites/gateway-site";
import { ExtState } from "../../ext-state";
import { SiteType } from "../../models/sites/site";
import { CloudSiteNode } from "./nodes/cloud-site-node";
import { GatewayNode } from "./nodes/gateway-node";

type Node = CloudSiteNode | GatewayNode | vscode.TreeItem;

export class SitesConnectionsProvider implements vscode.TreeDataProvider<Node> {
  private extState = ExtState.getInstance();

  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

  constructor() {
    this.extState.onDidAddSite(() => this.refresh(undefined));
    this.extState.onDidRemoveSite(() => this.refresh(undefined));
    this.extState.onDidDisconnectFromActiveSite(() => this.refresh(undefined));
    this.extState.onDidActivateSite(() => this.refresh(undefined));
    this.extState.onDidDisconnectAllSites(() => this.refresh(undefined));
  }

  refresh(node: Node | undefined) {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(element: Node): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Node): Promise<Node[]> {
    if (!element) {
      return this.getSites();
    }

    if ("getChildren" in element) {
      return element.getChildren();
    }

    return [];
  }

  async getSites(): Promise<Array<CloudSiteNode | GatewayNode>> {
    const activeSite = this.extState.getActiveSite();

    return ExtState.getInstance().allSites.map((site) => {
      const isActive = !!activeSite && activeSite.id === site.id;

      if (site.type === SiteType.Cloud) {
        return new CloudSiteNode(this, site as CloudSite, isActive);
      }

      if (site.type === SiteType.Gateway) {
        return new GatewayNode(this, site as GatewaySite, isActive);
      }

      throw new Error(`Unknown site type: ${JSON.stringify(site)}`);
    });
  }
}
