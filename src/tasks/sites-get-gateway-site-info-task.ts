import vscode from "vscode";
import { ApiClient } from "../api/client";

export class SitesGetGatewaySiteInfoTask {
  constructor(private readonly apiClient: ApiClient) {}

  static async run(apiClient: ApiClient, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesGetGatewaySiteInfoTask(apiClient).run();
  }

  async run() {
    return await this.apiClient.getGatewaySiteInfo();
  }
}
