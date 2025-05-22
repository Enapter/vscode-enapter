import vscode from "vscode";
import { AllLuaDevicesResponse, ApiClient } from "../api/client";
import { Logger } from "../logger";
import { Site } from "../models/sites/site";

export class DevicesFetchSiteDevicesTask {
  constructor(private readonly site: Site) {}

  static async run(site: Site, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new DevicesFetchSiteDevicesTask(site).run();
  }

  async run(): Promise<AllLuaDevicesResponse | undefined> {
    try {
      const apiClient = await ApiClient.forSite(this.site);

      if (!apiClient) {
        return { devices: [] };
      }

      const response = await apiClient
        .getSiteDevices(this.site)
        .unauthorized(() => this.showUnauthorizedError())
        .fetchError(() => this.showUnreachableError())
        .notFound(() => this.showSiteNotFoundError())
        .json<AllLuaDevicesResponse>()
        .then((res) => {
          if (!res || !res.devices) {
            Logger.log("DevicesFetchSiteDevicesTask: No devices found", res);
            return { devices: [] };
          }

          return {
            devices: res.devices.map((d) => ({ ...d, site: this.site })),
          } satisfies AllLuaDevicesResponse;
        })
        .catch((e) => {
          this.handleError(e);
        });

      if (!response) {
        return;
      }

      return response;
    } catch (e) {
      this.handleError(e);
    }
  }

  showUnauthorizedError() {
    vscode.window.showErrorMessage(`Unauthorized to access site "${this.site.name}". Please check your API token.`, {
      modal: true,
      detail: `Site ID: ${this.site.id}`,
    });
  }

  showUnreachableError() {
    vscode.window.showErrorMessage(
      `Unable to reach site "${this.site.name}". Please check your network connection and site status.`,
      {
        modal: true,
        detail: `Site ID: ${this.site.id}`,
      },
    );
  }

  showSiteNotFoundError() {
    vscode.window.showErrorMessage(
      `Site "${this.site.name}" not found. Please check your API token and that the site exists and is reachable.`,
      {
        modal: true,
        detail: `Site ID: ${this.site.id}`,
      },
    );
  }

  handleError(error: unknown) {
    Logger.log("DevicesFetchSiteDevicesTask error:", error);
  }
}
