import vscode from "vscode";

export const copyDeviceProperty = (node: any) => {
  vscode.env.clipboard.writeText(node.getPropertyValue());
};
