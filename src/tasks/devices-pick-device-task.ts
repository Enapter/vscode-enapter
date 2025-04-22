import vscode from "vscode";
import { Device } from "../models/device";

class DeviceQuickPickItem implements vscode.QuickPickItem {
  public label: string;
  public detail: string;

  constructor(public device: Device) {
    this.label = this.device.name;
    this.detail = this.device.id;
  }
}

export class DevicesPickDeviceTask {
  constructor(private devices: Device[]) {}

  static async run(devices: Device[], token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new DevicesPickDeviceTask(devices).run();
  }

  async run() {
    const items = this.devices.map((d) => new DeviceQuickPickItem(d));
    const selected = await vscode.window.showQuickPick(items);

    return selected?.device;
  }
}
