import vscode from "vscode";

export const mountEnbp = (uri: vscode.Uri) => {
  const enbp = vscode.Uri.parse(`enbp:/?${uri.fsPath}`);

  if (vscode.workspace.getWorkspaceFolder(enbp) === undefined) {
    const name = vscode.workspace.asRelativePath(uri, false);
    const index = vscode.workspace.workspaceFolders?.length || 0;
    const workspaceFolder: vscode.WorkspaceFolder = { uri: enbp, name, index };
    vscode.workspace.updateWorkspaceFolders(index, 0, workspaceFolder);
  }
};
