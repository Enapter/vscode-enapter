import vscode from "vscode";

export function getFilename(uri: vscode.Uri) {
  return uri.path.split("/").pop();
}
