import { ExtensionContext } from "vscode";
import { Manifest, SerializedManifest } from "./models/manifests/manifest";
import { Site, SiteType } from "./models/sites/site";
import { SiteRepository } from "./models/sites/sites-repository";

export class ExtState {
  private static instance: ExtState;
  public sitesRepository: SiteRepository | undefined;

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
