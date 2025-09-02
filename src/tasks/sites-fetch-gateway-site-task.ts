import vscode from "vscode";
import { ApiClient, SiteResponse } from "../api/client";
import { Logger } from "../logger";

export class SitesFetchGatewaySiteTask {
  constructor(
    private readonly address: string,
    private readonly apiToken: string,
  ) {}

  static async run(address: string, apiToken: string, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesFetchGatewaySiteTask(address, apiToken).run();
  }

  async run(): Promise<{ site: SiteResponse } | undefined> {
    try {
      const apiClient = ApiClient.forGateway(this.address, this.apiToken);

      const response = await apiClient
        .getGatewaySiteInfo()
        .notFound(() => this.showSiteNotFoundError())
        .unauthorized(() => this.showUnauthorizedError())
        .forbidden(() => this.showUnauthorizedError())
        .internalError(() => this.showUnreachableError())
        .fetchError(() => this.showUnreachableError())
        .json<{ site: SiteResponse }>()
        .catch((e) => {
          this.showUnexpectedError();
          this.handleError(e);
          Logger.log(e);
        });

      Logger.log(response);

      if (!response || !response.site) {
        return;
      }

      const id = response.site.id;

      if (!id) {
        return;
      }

      return response;
    } catch (e) {
      this.handleError(e);
    }
  }

  handleError(error: unknown) {
    Logger.log(error);
  }

  showUnauthorizedError() {
    vscode.window.showErrorMessage(
      `Unauthorized to access Enapter Gateway "${this.address}". Please check your API token.`,
      { modal: true },
    );
  }

  showUnreachableError() {
    vscode.window.showErrorMessage(
      `Unable to reach Enapter Gateway "${this.address}". Please check your network connection and Gateway status.`,
      { modal: true },
    );
  }

  showSiteNotFoundError() {
    vscode.window.showErrorMessage(
      `Failed to fetch Enapter Gateway site at "${this.address}". Please check your API token and that the Gateway has a site created, and that it is properly configured.`,
      { modal: true },
    );
  }

  showUnexpectedError() {
    vscode.window.showErrorMessage(
      `An unexpected error occurred while fetching the Enapter Gateway site. Please check your API token and that the Gateway exists and is reachable.`,
      { modal: true },
    );
  }
}
