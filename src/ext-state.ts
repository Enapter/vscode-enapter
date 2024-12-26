import vscode, { ExtensionContext } from "vscode";
import { Device } from "./models/device";
import { ContextKeys } from "./constants/context-keys";

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

    ExtState.instance = this;
  }

  async addRecentDevice(device: Device) {
    let recent = this.getRecentDevices();
    recent = recent.filter((d) => d.id !== device.id);
    await this.update("recentDevices", [device, ...recent]);
    this._onDidChangeDevices.fire();
  }

  getRecentDevices() {
    return (this.get<Device[]>("recentDevices") || [])
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
    await this.update("recentDevices", recent);
    this._onDidChangeDevices.fire();
  }

  getActiveDevice() {
    const device = this.get<Device | undefined>("activeDevice");
    this.setIsActiveDevicePresentContext(!!device);
    return device;
  }

  async setActiveDevice(device: Device) {
    await this.state.update("activeDevice", device);
    this.setIsActiveDevicePresentContext(true);
    return this._onDidChangeActiveDevice.fire(device);
  }

  async clearActiveDevice() {
    await this.state.update("activeDevice", undefined);
    this.setIsActiveDevicePresentContext(false);
    return this._onDidChangeActiveDevice.fire(undefined);
  }

  private setIsActiveDevicePresentContext(isActive: boolean) {
    vscode.commands.executeCommand("setContext", ContextKeys.Devices.IsActivePresent, isActive);
  }

  get<T>(key: string): T | undefined {
    return this.state.get<T>(key);
  }

  update(key: string, value: any): Thenable<void> {
    return this.state.update(key, value);
  }

  private get state() {
    return this.context.workspaceState;
  }
}
