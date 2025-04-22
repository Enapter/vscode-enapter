import vscode from "vscode";
import { ApiClient } from "../api/client";

export class SitesFetchAllCloudSites {
  constructor(private readonly apiClient: ApiClient) {}

  static async run(apiClient: ApiClient, token?: vscode.CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesFetchAllCloudSites(apiClient).run();
  }

  async run() {
    return this.apiClient.getAllSites();
  }
}
