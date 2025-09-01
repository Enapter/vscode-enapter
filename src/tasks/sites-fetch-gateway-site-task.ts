import vscode from "vscode";
import { ApiClient, SiteResponse } from "../api/client";
import { Logger } from "../logger";
import axios from 'axios';
import https from 'https';
import { request, Agent } from 'undici';
const agent = new Agent({
  connect: {
    rejectUnauthorized: false
  }
});

// axios.defaults.httpsAgent = new https.Agent({
//   rejectUnauthorized: false
// });

const api = axios.create({
  timeout: 5000,
  baseURL: "http://192.168.38.38/api",
  headers: {
    "X-Enapter-Auth-Token": "34d41f70b4ae9392944a3a5723c92a1cacace63b4525657fd363afcad7c79ce1",
    'X-Enapter-Allow-Http': 'true'
  },
})

export class SitesFetchGatewaySiteTask {
  constructor(
    private readonly address: string,
    private readonly apiToken: string,
  ) { }

  static async run(address: string, apiToken: string, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesFetchGatewaySiteTask(address, apiToken).run();
  }

  async run(): Promise<{ site: SiteResponse } | undefined> {
    try {
      const apiClient = ApiClient.forGateway(this.address, this.apiToken);

      // Logger.log("123Fetching Gateway site info...", this.address);

      // try {
      //   const { statusCode, headers, body } = await request('https://192.168.38.38/api/v3/site', {
      //     dispatcher: agent,
      //     headers: {
      //       'X-Enapter-Auth-Token': '34d41f70b4ae9392944a3a5723c92a1cacace63b4525657fd363afcad7c79ce1'
      //     }
      //   });

      //   const data = await body.text();
      //   console.log('Response:', data);
      // } catch (error: any) {
      //   console.error('Request failed:', error.message);
      // }

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

      Logger.log(response)

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
