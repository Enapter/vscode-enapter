import vscode from "vscode";
import { ApiTokenNode } from "../providers/sites-connections/nodes/api-token-node";

export const sitesCopyApiToken = async (node: ApiTokenNode) => {
  vscode.env.clipboard.writeText(await node.getPropertyValue());
};
