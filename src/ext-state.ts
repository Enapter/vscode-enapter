import vscode, { ExtensionContext } from "vscode";
import { Manifest, SerializedManifest } from "./models/manifests/manifest";
import { CloudSite } from "./models/sites/cloud-site";
import { GatewaySite } from "./models/sites/gateway-site";
import { Site, SiteType } from "./models/sites/site";
import { SiteRepository } from "./models/sites/sites-repository";

export class ExtState {
  private static instance: ExtState;
  public sitesRepository: SiteRepository | undefined;

  private _onDidAddSite = new vscode.EventEmitter<Site>();
  readonly onDidAddSite = this._onDidAddSite.event;

  private _onDidRemoveSite = new vscode.EventEmitter<Site>();
  readonly onDidRemoveSite = this._onDidRemoveSite.event;

  private _onDidActivateSite = new vscode.EventEmitter<Site | undefined>();
  readonly onDidActivateSite = this._onDidActivateSite.event;

  private _onDidDisconnectAllSites = new vscode.EventEmitter<void>();
  readonly onDidDisconnectAllSites = this._onDidDisconnectAllSites.event;

  private _onDidDisconnectFromActiveSite = new vscode.EventEmitter<Site>();
  readonly onDidDisconnectFromActiveSite = this._onDidDisconnectFromActiveSite.event;

  constructor(private readonly context: ExtensionContext) {
    if (ExtState.instance) {
      throw new Error("ExtState is already initialized");
    }

    this.sitesRepository = new SiteRepository(this.globalState);

    ExtState.instance = this;
  }

  static getInstance(): ExtState {
    if (!ExtState.instance) {
      throw new Error("ExtState is not initialized");
    }

    return ExtState.instance;
  }

  async setRecentManifest(manifest: Manifest) {
    await this.updateWsState("recentManifest", manifest.serialize());
  }

  getRecentManifest() {
    const serialized = this.getWsState<SerializedManifest>("recentManifest");
    return serialized ? Manifest.deserialize(serialized) : undefined;
  }

  getWsState<T>(key: string): T | undefined {
    return this.wsState.get<T>(key);
  }

  getGlobalState<T>(key: string): T | undefined {
    return this.globalState.get<T>(key);
  }

  updateWsState(key: string, value: any): Thenable<void> {
    return this.wsState.update(key, value);
  }

  updateGlobalState(key: string, value: any): Thenable<void> {
    return this.globalState.update(key, value);
  }

  get allSites() {
    return this.sitesRepository!.getAll();
  }

  getSiteById(id: string) {
    return this.sitesRepository!.getById(id);
  }

  async storeSite(site: CloudSite | GatewaySite) {
    return this.sitesRepository!.add(site).then(() => {
      this._onDidAddSite.fire(site);
    });
  }

  async removeSite(site: CloudSite | GatewaySite) {
    const id = this.getActiveSite()?.id;

    return this.sitesRepository!.remove(site.id).then(() => {
      this._onDidRemoveSite.fire(site);

      if (!!id && site.id === id) {
        this._onDidDisconnectFromActiveSite.fire(site);
      }
    });
  }

  async activateSite(site: CloudSite | GatewaySite) {
    return this.sitesRepository!.activate(site.id).then((activeSite) => {
      this._onDidActivateSite.fire(activeSite);
    });
  }

  async removeAllSites() {
    return this.sitesRepository!.removeAll().then(() => {
      this._onDidDisconnectAllSites.fire();
    });
  }

  async disconnectFromActiveSite() {
    const site = this.getActiveSite();

    if (!site) {
      return;
    }

    await this.sitesRepository!.activate(undefined);
    this._onDidDisconnectFromActiveSite.fire(site);
  }

  getActiveSite(): Site | undefined {
    return this.sitesRepository!.getActiveSite();
  }

  storeCloudApiToken(apiToken: string) {
    return this.sitesRepository!.storeCloudApiToken(apiToken);
  }

  getCloudApiToken() {
    return this.sitesRepository!.getCloudApiToken();
  }

  deleteCloudApiToken() {
    return this.sitesRepository!.deleteCloudApiToken();
  }

  isCloudApiTokenSet() {
    return this.sitesRepository!.isCloudApiTokenSet();
  }

  storeGatewayApiToken(site: Site, apiToken: string) {
    return this.sitesRepository!.storeGatewayApiToken(site, apiToken);
  }

  getGatewayApiToken(site: Site) {
    return this.sitesRepository!.getGatewayApiToken(site);
  }

  async getSiteApiToken(site: Site) {
    return site.type === SiteType.Cloud ? this.getCloudApiToken() : this.getGatewayApiToken(site);
  }

  private get wsState() {
    return this.context.workspaceState;
  }

  private get globalState() {
    return this.context.globalState;
  }
}
