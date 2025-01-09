import vscode from "vscode";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";

export const checkConnection = () => {
  const api = new ApiClient();

  if (!api.isConfigured) {
    vscode.window.showErrorMessage("API key or host is not configured");
    return;
  }

  api
    .checkConnection()
    .then(() => {
      vscode.window.showInformationMessage("Connection successful");
    })
    .catch((error) => {
      Logger.getInstance().log(error);
      vscode.window.showErrorMessage("Connection failed");
    });
};
