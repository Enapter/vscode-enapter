import vscode from "vscode";
import { CloudSite } from "./models/sites/cloud-site";
import { GatewaySite } from "./models/sites/gateway-site";
import { EnapterGatewayIcon, GlobeIcon, KeyIcon, WarningIcon } from "./ui/icons";
import { ExtState } from "./ext-state";
import { SiteType } from "./models/sites/site";

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
  error: string | undefined = undefined;

  constructor(
    private readonly provider: SitesProvider,
    public remote: CloudSite,
    isActive: boolean,
  ) {
    super(remote.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.setIcon(!!this.error);
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  refresh() {
    this.provider.refresh(this);
  }

  getChildren(): vscode.TreeItem[] {
    return [!!this.error && { label: `Error: ${this.error}` }, new ApiTokenPropertyNode(this.remote)].filter(
      (i) => !!i,
    );
  }

  setError(message: string | undefined) {
    this.error = message;
    this.setIcon(!!message);
  }

  setIcon(isInvalid: boolean) {
    this.iconPath = isInvalid ? new WarningIcon() : new EnapterGatewayIcon();
  }

  setContextValue(isActive: boolean) {
    this.contextValue = isActive ? "enapter.viewItems.ActiveSite" : "enapter.viewItems.Site";
  }

  setDescription(isActive: boolean) {
    this.description = isActive ? "Active" : undefined;
  }
}

export class GatewayNode extends vscode.TreeItem {
  error: string | undefined = undefined;

  constructor(
    private readonly provider: SitesProvider,
    public remote: GatewaySite,
    isActive: boolean,
  ) {
    super(remote.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.setIcon(!!this.error);
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    return [
      !!this.error && { label: `Error: ${this.error}` },
      { label: this.remote.address, iconPath: new GlobeIcon() },
      new ApiTokenPropertyNode(this.remote),
    ].filter((i) => !!i);
  }

  refresh() {
    this.provider.refresh(this);
  }

  setError(message: string | undefined) {
    this.error = message;
    this.setIcon(!!message);
  }

  setIcon(isInvalid: boolean) {
    this.iconPath = isInvalid ? new WarningIcon() : new EnapterGatewayIcon();
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

  async getSites(): Promise<Array<CloudNode | GatewayNode>> {
    const activeSite = this.extState.getActiveSite();

    return ExtState.getInstance().allSites.map((site) => {
      const isActive = !!activeSite && activeSite.id === site.id;

      if (site.type === SiteType.Cloud) {
        return new CloudNode(this, site as CloudSite, isActive);
      }

      if (site.type === SiteType.Gateway) {
        return new GatewayNode(this, site as GatewaySite, isActive);
      }

      throw new Error(`Unknown site type: ${JSON.stringify(site)}`);
    });
  }
}
