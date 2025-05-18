import vscode from "vscode";
import { Device } from "../models/device";

export class DevicesOnSiteStorage {
  static STORAGE_KEY = "Enapter.Storage.Devices.DevicesOnSite";

  constructor(private readonly storage: vscode.Memento) {}

  getAll() {
    return this.storage.get<Device[]>(this.key, []);
  }

  async updateAll(devices: Device[] | undefined) {
    return this.storage.update(this.key, devices);
  }

  private get key() {
    return DevicesOnSiteStorage.STORAGE_KEY;
  }
}
