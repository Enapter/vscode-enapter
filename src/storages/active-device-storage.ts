import vscode from "vscode";
import { Device } from "../models/device";

export class ActiveDeviceStorage {
  static STORAGE_KEY = "Enapter.Storage.Devices.ActiveDevice";

  constructor(private readonly storage: vscode.Memento) {}

  get() {
    return this.storage.get<Device>(this.key);
  }

  async update(device: Device | undefined) {
    return this.storage.update(this.key, device);
  }

  private get key() {
    return ActiveDeviceStorage.STORAGE_KEY;
  }
}
