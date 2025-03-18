import vscode, { ExtensionContext } from "vscode";
import { Device } from "./models/device";
import { ContextKeys } from "./constants/context-keys";
import { Manifest, SerializedManifest } from "./models/manifests/manifest";
import { ExtSettings } from "./ext-settings";

export class ExtState {
  static instance: ExtState;
  private _onDidChangeDevices = new vscode.EventEmitter<void>();
  readonly onDidChangeDevices = this._onDidChangeDevices.event;
  private _onDidChangeActiveDevice = new vscode.EventEmitter<Device | undefined>();
  readonly onDidChangeActiveDevice = this._onDidChangeActiveDevice.event;

  constructor(private readonly context: ExtensionContext) {
    if (ExtState.instance) {
      return ExtState.instance;
    }

    const extSettings = ExtSettings.instance;
    extSettings.onDidChangeConnectionSettings(this.clearActiveDevice.bind(this));

    ExtState.instance = this;
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
          };
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

  private get wsState() {
    return this.context.workspaceState;
  }

  private get globalState() {
    return this.context.globalState;
  }
}
