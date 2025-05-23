import vscode from "vscode";
import { ActiveDeviceStorage } from "../storages/active-device-storage";
import { Device, isDeviceOnline } from "../models/device";
import { ContextKeys } from "../constants/context-keys";

export class ActiveDeviceService {
  private readonly _onDidChangeDevice: vscode.EventEmitter<Device | undefined> = new vscode.EventEmitter<Device>();
  readonly onDidChangeDevice: vscode.Event<Device | undefined> = this._onDidChangeDevice.event;

  constructor(private readonly storage: ActiveDeviceStorage) {}

  getDevice() {
    const device = this.storage.get();
    this.setDeviceContext(device);
    return device;
  }

  async updateDevice(device: Device | undefined) {
    this.storage.update(device).then(() => {
      this.setDeviceContext(device);
      this._onDidChangeDevice.fire(device);
    });
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
