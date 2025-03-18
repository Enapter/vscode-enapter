import vscode from "vscode";

export const openEnbpTreeItem = async (uri: vscode.Uri) => {
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });
};
