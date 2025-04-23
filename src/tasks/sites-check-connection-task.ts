import vscode from "vscode";
import { Site } from "../models/sites/site";
import { ApiClient, InvalidSiteTypeError, SiteResponse, TokenNotFoundError } from "../api/client";
import { Logger } from "../logger";

export class SitesCheckConnectionTask {
  constructor(private readonly site: Site) {}

  static async run(site: Site, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesCheckConnectionTask(site).run();
  }

  async run() {
    try {
      const apiClient = await ApiClient.forSite(this.site);

      const {
        site: { id },
      } = await apiClient
        .getSiteInfo(this.site)
        .notFound(() => {
          vscode.window.showErrorMessage(
            `Site "${this.site.name}" not found. Please check your API token and that the site exists and is reachable.`,
            { modal: true, detail: `Site ID: ${this.site.id}` },
          );
        })
        .json<{ site: SiteResponse }>();

      if (!id) {
        vscode.window.showErrorMessage(
          `Unable to connect to site ${this.site.name}. Please check your API token and that the site exists and is reachable.`,
          { modal: true, detail: `Site ID: ${this.site.id}` },
        );

        return;
      }

      if (id !== this.site.id) {
        vscode.window.showErrorMessage(
          `Site ID mismatch for site ${this.site.name}. Please check your API token and that the site exists and is reachable.`,
          { modal: true, detail: `Site ID: ${this.site.id}` },
        );

        return;
      }

      return true;
    } catch (e) {
      Logger.log(e);

      if (e instanceof TokenNotFoundError) {
        vscode.window.showErrorMessage(
          `No API token found for site ${this.site.name}. Please set the API token in the settings.`,
          { modal: true, detail: `Site ID: ${this.site.id}` },
        );

        return;
      }

      if (e instanceof InvalidSiteTypeError) {
        vscode.window.showErrorMessage(
          `Invalid site type for site ${this.site.name}. Please disconnect from this site and connect again.`,
          { modal: true, detail: `Site ID: ${this.site.id}` },
        );

        return;
      }
    }
  }
}
