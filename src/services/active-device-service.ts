import vscode from "vscode";
import { ActiveDeviceStorage } from "../storages/active-device-storage";
import { Device, isDeviceOnline } from "../models/device";
import { ContextKeys } from "../constants/context-keys";
import { isEqual } from "es-toolkit";

export class ActiveDeviceService {
  private readonly _onDidChangeDevice: vscode.EventEmitter<Device | undefined> = new vscode.EventEmitter<Device>();
  readonly onDidChangeDevice: vscode.Event<Device | undefined> = this._onDidChangeDevice.event;

  constructor(private readonly storage: ActiveDeviceStorage) {}

  getDevice() {
    const device = this.storage.get();
    this.setDeviceContext(device);
    return device;
  }

  async replaceDevice(device: Device | undefined) {
    this.storage.update(device).then(() => {
      this.setDeviceContext(device);
      this._onDidChangeDevice.fire(device);
    });
  }

  async updateDevice(device: Device | undefined) {
    const currentDevice = this.getDevice();

    if (!device && currentDevice) {
      return this.replaceDevice(device);
    }

    if (!currentDevice) {
      return this.replaceDevice(device);
    }

    if (isEqual(device, currentDevice)) {
      return;
    }

    const updatedDevice = { ...currentDevice, ...device };
    return this.replaceDevice(updatedDevice);
  }

  private setDeviceContext(device: Device | undefined) {
    vscode.commands.executeCommand("setContext", ContextKeys.Devices.IsActivePresent, !!device);

    vscode.commands.executeCommand(
      "setContext",
      ContextKeys.Devices.IsActiveOnline,
      !!device && isDeviceOnline(device),
    );
  }
}
