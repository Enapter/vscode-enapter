import vscode from "vscode";
import { Logger } from "../logger";
import { DevicesOnSiteService } from "./devices-on-site-service";
import { SitesConnectionsService } from "./sites-connections-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";

export class DevicesOnSitePollingService implements vscode.Disposable {
  private interval: NodeJS.Timeout | undefined;
  private readonly INTERVAL_MS = 30_000;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly sitesConnectionsService: SitesConnectionsService,
    private readonly devicesOnSiteService: DevicesOnSiteService,
  ) {
    this.disposables.push(
      sitesConnectionsService.onDidChangeActiveSite(() => {
        this.start();
      }),
    );
  }

  start() {
    this.stop();
    const site = this.sitesConnectionsService.getActive();

    if (!site) {
      return;
    }

    this.interval = setInterval(async () => {
      await this.fetchDevices();
    }, this.INTERVAL_MS);

    void this.fetchDevices();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  async fetchDevices() {
    try {
      const site = this.sitesConnectionsService.getActive();

      if (!site) {
        this.stop();
        return;
      }

      const response = await DevicesFetchSiteDevicesTask.run(site);

      if (!response) {
        await this.sitesConnectionsService.disconnectById(site.id);
        return;
      }

      const devices = this.devicesOnSiteService.getAll();
      await this.devicesOnSiteService.updateAll(this.devicesOnSiteService.merge(response.devices, devices));
    } catch (e: unknown) {
      Logger.log(e);
    }
  }

  dispose() {
    this.stop();
    vscode.Disposable.from(...this.disposables).dispose();
  }
}
