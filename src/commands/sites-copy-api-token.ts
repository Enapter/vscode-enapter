import vscode from "vscode";
import { ApiTokenPropertyNode } from "../sites-provider";

export const sitesCopyApiToken = async (node: ApiTokenPropertyNode) => {
  vscode.env.clipboard.writeText(await node.getPropertyValue());
};
