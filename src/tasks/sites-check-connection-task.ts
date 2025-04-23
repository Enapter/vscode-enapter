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
        .notFound(() => this.showSiteNotFoundError())
        .json<{ site: SiteResponse }>();

      if (!id) {
        return;
      }

      if (id !== this.site.id) {
        this.showSiteMismatchError();
        return;
      }

      return true;
    } catch (e) {
      return this.handleError(e);
    }
  }

  handleError(error: unknown) {
    if (error instanceof TokenNotFoundError) {
      this.showTokenNotFoundError();
    } else if (error instanceof InvalidSiteTypeError) {
      this.showInvalidSiteTypeError();
    } else {
      Logger.log(error);
    }
  }

  showSiteNotFoundError() {
    vscode.window.showErrorMessage(
      `Site "${this.site.name}" not found. Please check your API token and that the site exists and is reachable.`,
      { modal: true, detail: `Site ID: ${this.site.id}` },
    );
  }

  showSiteMismatchError() {
    vscode.window.showErrorMessage(
      `Site ID mismatch for site "${this.site.name}". Please check your API token and that the site exists and is reachable.`,
      { modal: true, detail: `Site ID: ${this.site.id}` },
    );
  }

  showTokenNotFoundError() {
    vscode.window.showErrorMessage(
      `No API token found for site "${this.site.name}". Please set the API token in the settings.`,
      { modal: true, detail: `Site ID: ${this.site.id}` },
    );
  }

  showInvalidSiteTypeError() {
    vscode.window.showErrorMessage(
      `Invalid site type for site "${this.site.name}". Please disconnect from this site and connect again.`,
      { modal: true, detail: `Site ID: ${this.site.id}` },
    );
  }
}
