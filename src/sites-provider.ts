import vscode from "vscode";
import { CloudSite } from "./models/sites/cloud-site";
import { GatewaySite } from "./models/sites/gateway-site";
import { EnapterCloudIcon, EnapterGatewayIcon, GlobeIcon, KeyIcon } from "./ui/icons";
import { ExtState } from "./ext-state";
import { SiteType } from "./models/sites/site";
import { Logger } from "./logger";

export class ApiTokenPropertyNode extends vscode.TreeItem {
  static labelWhenHidden = "API Token: [hidden]";

  constructor(private site: CloudSite | GatewaySite) {
    super(ApiTokenPropertyNode.labelWhenHidden, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new KeyIcon();
    this.contextValue = "enapter.viewItems.ApiTokenProperty";
  }

  async getPropertyValue() {
    const extState = ExtState.getInstance();
    const token =
      this.site.type === SiteType.Cloud
        ? await extState.getCloudApiToken()
        : await extState.getGatewayApiToken(this.site);

    return token || "";
  }
}

export class CloudNode extends vscode.TreeItem {
  constructor(
    public remote: CloudSite,
    isActive: boolean,
  ) {
    super(remote.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new EnapterCloudIcon();
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  getChildren(): vscode.TreeItem[] {
    return [new ApiTokenPropertyNode(this.remote)];
  }

  setContextValue(isActive: boolean) {
    this.contextValue = isActive ? "enapter.viewItems.ActiveSite" : "enapter.viewItems.Site";
  }

  setDescription(isActive: boolean) {
    this.description = isActive ? "Active" : undefined;
  }
}

export class GatewayNode extends vscode.TreeItem {
  constructor(
    public remote: GatewaySite,
    isActive: boolean,
  ) {
    super(remote.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new EnapterGatewayIcon();
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    return [{ label: this.remote.address, iconPath: new GlobeIcon() }, new ApiTokenPropertyNode(this.remote)];
  }

  setContextValue(isActive: boolean) {
    this.contextValue = isActive ? "enapter.viewItems.ActiveSite" : "enapter.viewItems.Site";
  }

  setDescription(isActive: boolean) {
    this.description = isActive ? "Active" : undefined;
  }
}

type Node = CloudNode | GatewayNode | vscode.TreeItem;

export class SitesProvider implements vscode.TreeDataProvider<Node> {
  private extState = ExtState.getInstance();

  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

  constructor() {
    this.extState.onDidAddSite(this.refresh.bind(this));
    this.extState.onDidRemoveSite(this.refresh.bind(this));
    this.extState.onDidDisconnectFromActiveSite(this.refresh.bind(this));
    this.extState.onDidActivateSite(this.refresh.bind(this));
    this.extState.onDidDisconnectAllSites(this.refresh.bind(this));
  }

  private refresh() {
    Logger.log("Refreshing sites tree");
    this._onDidChangeTreeData.fire(undefined);
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

  async getSites(): Promise<Array<CloudNode | GatewayNode>> {
    const activeSite = this.extState.getActiveSite();

    return ExtState.getInstance().allSites.map((site) => {
      const isActive = !!activeSite && activeSite.id === site.id;

      if (site.type === SiteType.Cloud) {
        return new CloudNode(site as CloudSite, isActive);
      }

      if (site.type === SiteType.Gateway) {
        return new GatewayNode(site as GatewaySite, isActive);
      }

      throw new Error(`Unknown site type: ${JSON.stringify(site)}`);
    });
  }
}
