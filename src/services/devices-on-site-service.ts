import vscode from "vscode";
import { Device } from "../models/device";
import { DevicesOnSiteStorage } from "../storages/devices-on-site-storage";
import { ActiveDeviceService } from "./active-device-service";

export class DevicesOnSiteService {
  private readonly _onDidChangeDevices: vscode.EventEmitter<Device[]> = new vscode.EventEmitter<Device[]>();
  readonly onDidChangeDevices: vscode.Event<Device[]> = this._onDidChangeDevices.event;

  constructor(
    private readonly storage: DevicesOnSiteStorage,
    private readonly activeDeviceService: ActiveDeviceService,
  ) {}

  getAll() {
    return this.storage.getAll();
  }

  async updateAll(devices: Device[]) {
    return this.storage.updateAll(devices).then(() => {
      this._onDidChangeDevices.fire(devices);
    });
  }

  async connectById(deviceId: string): Promise<Device | undefined> {
    const storedDevices = this.getAll();

    if (!storedDevices?.length) {
      return;
    }

    const device = storedDevices.find((d) => d.id === deviceId);

    if (!device || device.isActive) {
      return;
    }

    const devices = storedDevices.map((d) => {
      d.isActive = d.id === deviceId;
      return d;
    });

    await this.updateAll(devices);
    await this.activeDeviceService.updateDevice(device);
  }

  async disconnectById(deviceId: string): Promise<Device | undefined> {
    const storedDevices = this.getAll();

    if (!storedDevices?.length) {
      return;
    }

    const device = storedDevices.find((d) => d.id === deviceId);

    if (!device || !device.isActive) {
      return;
    }

    const devices = storedDevices.map((d) => {
      d.isActive = false;
      return d;
    });

    await this.updateAll(devices);
    await this.activeDeviceService.updateDevice(undefined);
  }
}
