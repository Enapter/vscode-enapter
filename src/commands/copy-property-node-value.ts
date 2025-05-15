import vscode from "vscode";
import { PropertyNode } from "../providers/shared-nodes/property-node";

export const copyPropertyNodeValue = <T extends PropertyNode>(node: T) => {
  vscode.env.clipboard.writeText(node.getPropertyValue());
};
