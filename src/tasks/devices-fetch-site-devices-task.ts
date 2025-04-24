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

  async run(): Promise<AllLuaDevicesResponse> {
    try {
      const apiClient = await ApiClient.forSite(this.site);

      if (!apiClient) {
        return { devices: [] };
      }

      return await apiClient
        .getSiteDevices(this.site)
        .unauthorized(() => {
          this.showUnauthorizedError();
          throw new Error("Unauthorized");
        })
        .fetchError(() => {
          this.showUnreachableError();
          throw new Error("Unreachable");
        })
        .notFound(() => {
          this.showSiteNotFoundError();
          throw new Error("Site not found");
        })
        .json<AllLuaDevicesResponse>()
        .catch((e) => {
          this.handleError(e);
          return this.defaultResponse;
        });
    } catch (e) {
      this.handleError(e);
      return this.defaultResponse;
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

  get defaultResponse(): AllLuaDevicesResponse {
    return { devices: [] };
  }
}
