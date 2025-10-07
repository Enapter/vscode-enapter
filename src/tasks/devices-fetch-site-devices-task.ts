import vscode from "vscode";
import { AllLuaDevicesResponse, ApiClient } from "../api/client";
import { Logger } from "../logger";
import { Site } from "../models/sites/site";
import { isSupportBlueprints, sortByOnlineStatus, sortDevicesByName } from "../models/device";

interface Options {
  isMuted: boolean;
}

export class DevicesFetchSiteDevicesTask {
  constructor(
    private readonly site: Site,
    private readonly options: Options = {
      isMuted: false,
    },
  ) {}

  static async run(site: Site, options?: Options, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new DevicesFetchSiteDevicesTask(site, options).run();
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
            return;
          }

          return {
            devices: res.devices
              .filter(isSupportBlueprints)
              .sort(sortDevicesByName)
              .sort(sortByOnlineStatus)
              .map((d) => ({ ...d, site: this.site })),
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
    if (this.options.isMuted) return;
    vscode.window.showErrorMessage(`Unauthorized to access site "${this.site.name}". Please check your API token.`, {
      modal: true,
      detail: `Site ID: ${this.site.id}`,
    });
  }

  showUnreachableError() {
    if (this.options.isMuted) return;
    vscode.window.showErrorMessage(
      `Unable to reach site "${this.site.name}". Please check your network connection and site status.`,
      {
        modal: true,
        detail: `Site ID: ${this.site.id}`,
      },
    );
  }

  showSiteNotFoundError() {
    if (this.options.isMuted) return;
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
