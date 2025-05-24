import vscode from "vscode";
import { ActiveDeviceService } from "./active-device-service";
import { Logger } from "../logger";
import { ApiClient } from "../api/client";

export class ActiveDevicePollingService implements vscode.Disposable {
  private interval: NodeJS.Timeout | undefined;
  private readonly INTERVAL_MS = 30_000;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly service: ActiveDeviceService) {
    this.disposables.push(
      service.onDidChangeDevice(() => {
        this.start();
      }),
    );
  }

  start() {
    this.stop();
    const device = this.service.getDevice();

    if (!device) {
      return;
    }

    this.interval = setInterval(async () => {
      await this.fetchDevice();
    }, this.INTERVAL_MS);

    void this.fetchDevice();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  async fetchDevice() {
    try {
      const device = this.service.getDevice();

      if (!device) {
        this.stop();
        return;
      }

      const apiClient = await ApiClient.forSite(device.site);

      if (!apiClient) {
        return;
      }

      const response = await apiClient.getDeviceById(device.site_id, device.id);

      if (!response) {
        return;
      }

      if (response.device.id !== device.id) {
        return;
      }

      await this.service.updateDevice({ ...device, ...response.device });
    } catch (e: unknown) {
      Logger.log(e);
    }
  }

  dispose() {
    this.stop();
    vscode.Disposable.from(...this.disposables).dispose();
  }
}
