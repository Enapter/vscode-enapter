import vscode from "vscode";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";

export const checkConnection = () => {
  const api = new ApiClient();

  if (!api.isConfigured) {
    vscode.window.showErrorMessage("API key or host is not configured");
    return;
  }

  const logger = Logger.getInstance();

  const handleError = (err: any) => {
    logger.log(err);
    vscode.window.showErrorMessage("Connection failed");
  };

  api
    .checkConnection()
    .res((res) => {
      if (!res.ok) {
        handleError(res.statusText);
      }

      vscode.window.showInformationMessage("Connection successful");
    })
    .catch((error) => {
      handleError(error);
    });
};
