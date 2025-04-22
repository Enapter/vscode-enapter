import vscode, { ExtensionContext } from "vscode";
import { Device } from "./models/device";
import { ContextKeys } from "./constants/context-keys";
import { Manifest, SerializedManifest } from "./models/manifests/manifest";
import { ExtSettings } from "./ext-settings";
import { CloudSite } from "./models/sites/cloud-site";
import { GatewaySite } from "./models/sites/gateway-site";
import { Site } from "./models/sites/site";
import { SiteRepository } from "./models/sites/sites-repository";

export class ExtState {
  private static instance: ExtState;
  public sitesRepository: SiteRepository | undefined;

  private _onDidChangeDevices = new vscode.EventEmitter<void>();
  readonly onDidChangeDevices = this._onDidChangeDevices.event;

  private _onDidChangeActiveDevice = new vscode.EventEmitter<Device | undefined>();
  readonly onDidChangeActiveDevice = this._onDidChangeActiveDevice.event;

  private _onDidAddSite = new vscode.EventEmitter<Site>();
  readonly onDidAddSite = this._onDidAddSite.event;

  private _onDidRemoveSite = new vscode.EventEmitter<Site>();
  readonly onDidRemoveSite = this._onDidRemoveSite.event;

  private _onDidActivateSite = new vscode.EventEmitter<Site>();
  readonly onDidActivateSite = this._onDidActivateSite.event;

  private _onDidDisconnectAllSites = new vscode.EventEmitter<void>();
  readonly onDidDisconnectAllSites = this._onDidDisconnectAllSites.event;

  constructor(private readonly context: ExtensionContext) {
    if (ExtState.instance) {
      throw new Error("ExtState is already initialized");
    }

    this.sitesRepository = new SiteRepository(this.globalState);
    const extSettings = ExtSettings.getInstance();
    extSettings.onDidChangeConnectionSettings(this.clearActiveDevice.bind(this));

    ExtState.instance = this;
  }

  static getInstance(): ExtState {
    if (!ExtState.instance) {
      throw new Error("ExtState is not initialized");
    }

    return ExtState.instance;
  }

  async addRecentDevice(device: Device) {
    let recent = this.getRecentDevices();
    recent = recent.filter((d) => d.id !== device.id);
    await this.updateGlobalState("recentDevices", [device, ...recent]);
    this._onDidChangeDevices.fire();
  }

  getRecentDevices() {
    return (this.getGlobalState<Device[]>("recentDevices") || [])
      .map((d) => {
        try {
          return {
            id: d.id,
            blueprint_id: d.blueprint_id,
            site_id: d.site_id,
            name: d.name,
            updated_at: d.updated_at,
            authorized_role: d.authorized_role,
            type: d.type,
            properties: d.properties,
            site: {},
          } as Device;
        } catch (_) {
          return null;
        }
      })
      .filter((d) => !!d);
  }

  async removeRecentDevice(device: Device) {
    let recent = this.getRecentDevices();
    recent = recent.filter((d) => d.id !== device.id);
    await this.updateGlobalState("recentDevices", recent);
    this._onDidChangeDevices.fire();
  }

  getActiveDevice() {
    const device = this.getGlobalState<Device | undefined>("activeDevice");
    this.setIsActiveDevicePresentContext(!!device);
    return device;
  }

  async setActiveDevice(device: Device) {
    await this.updateGlobalState("activeDevice", device);
    this.setIsActiveDevicePresentContext(true);
    return this._onDidChangeActiveDevice.fire(device);
  }

  async clearActiveDevice() {
    await this.updateGlobalState("activeDevice", undefined);
    this.setIsActiveDevicePresentContext(false);
    return this._onDidChangeActiveDevice.fire(undefined);
  }

  private setIsActiveDevicePresentContext(isActive: boolean) {
    vscode.commands.executeCommand("setContext", ContextKeys.Devices.IsActivePresent, isActive);
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
    return this.sitesRepository!.remove(site.id).then(() => {
      this._onDidRemoveSite.fire(site);
    });
  }

  async activateSite(site: CloudSite | GatewaySite) {
    return this.sitesRepository!.activate(site.id).then((activeSite) => {
      this._onDidActivateSite.fire(activeSite);
      this.clearActiveDevice();
    });
  }

  async disconnectAllSites() {
    return this.sitesRepository!.removeAll().then(() => {
      this._onDidDisconnectAllSites.fire();
      this.clearActiveDevice();
    });
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

  private get wsState() {
    return this.context.workspaceState;
  }

  private get globalState() {
    return this.context.globalState;
  }
}
