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
      let message = "";

      const response = await apiClient
        .getSiteInfo(this.site)
        .notFound(() => (message = this.showSiteNotFoundError()))
        .unauthorized(() => (message = this.showUnauthorizedError()))
        .forbidden(() => (message = this.showUnauthorizedError()))
        .internalError(() => (message = this.showUnreachableError()))
        .fetchError(() => (message = this.showUnreachableError()))
        .json<{ site: SiteResponse }>()
        .catch((e) => {
          this.handleError(e);
        });

      if (!response || !response.site) {
        return message;
      }

      const id = response.site.id;

      if (!id) {
        return this.showSiteNotFoundError();
      }

      if (id !== this.site.id) {
        return this.showSiteMismatchError();
      }

      return response.site;
    } catch (e) {
      return this.handleError(e);
    }
  }

  handleError(error: unknown): string {
    if (error instanceof TokenNotFoundError) {
      return this.showTokenNotFoundError();
    } else if (error instanceof InvalidSiteTypeError) {
      return this.showInvalidSiteTypeError();
    } else {
      Logger.log(error);
      return "";
    }
  }

  showUnauthorizedError() {
    const message = `Unauthorized to access site "${this.site.name}". Please check your API token.`;

    vscode.window.showErrorMessage(message, {
      modal: true,
      detail: `Site ID: ${this.site.id}`,
    });

    return message;
  }

  showUnreachableError() {
    const message = `Unable to reach site "${this.site.name}". Please check your network connection and site status.`;
    vscode.window.showErrorMessage(message, { modal: true, detail: `Site ID: ${this.site.id}` });
    return message;
  }

  showSiteNotFoundError() {
    const message = `Site "${this.site.name}" not found. Please check your API token and that the site exists and is reachable.`;

    vscode.window.showErrorMessage(message, { modal: true, detail: `Site ID: ${this.site.id}` });
    return message;
  }

  showSiteMismatchError() {
    const message = `Site ID mismatch for site "${this.site.name}". Please check your API token and that the site exists and is reachable.`;

    vscode.window.showErrorMessage(message, { modal: true, detail: `Site ID: ${this.site.id}` });
    return message;
  }

  showTokenNotFoundError() {
    const message = `No API token found for site "${this.site.name}". Please set the API token in the settings.`;

    vscode.window.showErrorMessage(message, { modal: true, detail: `Site ID: ${this.site.id}` });
    return message;
  }

  showInvalidSiteTypeError() {
    const message = `Invalid site type for site "${this.site.name}". Please disconnect from this site and connect again.`;

    vscode.window.showErrorMessage(message, { modal: true, detail: `Site ID: ${this.site.id}` });
    return message;
  }
}
