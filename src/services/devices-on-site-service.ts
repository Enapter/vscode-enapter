import vscode from "vscode";
import { Device } from "../models/device";
import { DevicesOnSiteStorage } from "../storages/devices-on-site-storage";
import { ActiveDeviceService } from "./active-device-service";
import { isEqual } from "es-toolkit";
import { Logger } from "../logger";

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

  async replaceAll(devices: Device[]) {
    return this.storage.updateAll(devices).then(() => {
      this._onDidChangeDevices.fire(devices);
    });
  }

  async updateAll(devices: Device[]) {
    const all = this.getAll();

    if (all.length !== devices.length) {
      return this.replaceAll(devices);
    }

    const isAllSame = devices.every((device) => {
      const existingDevice = all.find((d) => d.id === device.id);
      return existingDevice && isEqual(existingDevice, device);
    });

    if (isAllSame) {
      return;
    }

    const mergedDevices = this.merge(all, devices);
    return this.replaceAll(mergedDevices);
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

    await this.replaceAll(devices);
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

    await this.replaceAll(devices);
    await this.activeDeviceService.updateDevice(undefined);
  }

  merge(devicesMain: Device[], devicesToMerge: Device[]): Device[] {
    return devicesMain.map((device) => {
      const deviceToMerge = devicesToMerge.find((d) => d.id === device.id);
      if (deviceToMerge) {
        return { ...device, ...deviceToMerge };
      }
      return device;
    });
  }
}
