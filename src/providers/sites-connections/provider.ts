import vscode from "vscode";
import { CloudSite } from "../../models/sites/cloud-site";
import { GatewaySite } from "../../models/sites/gateway-site";
import { SiteType } from "../../models/sites/site";
import { CloudSiteNode } from "./nodes/cloud-site-node";
import { GatewayNode } from "./nodes/gateway-node";
import { SitesConnectionsService } from "../../services/sites-connections-service";

type Node = CloudSiteNode | GatewayNode | vscode.TreeItem;

export class SitesConnectionsProvider implements vscode.TreeDataProvider<Node> {
  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

  constructor(private readonly service: SitesConnectionsService) {
    this.service.onDidChangeSites(() => this.refresh(undefined));
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
    const sites = this.service.getAll();

    return sites.map((site) => {
      if (site.type === SiteType.Cloud) {
        return new CloudSiteNode(this, site as CloudSite);
      }

      if (site.type === SiteType.Gateway) {
        return new GatewayNode(this, site as GatewaySite);
      }

      throw new Error(`Unknown site type: ${JSON.stringify(site)}`);
    });
  }
}
