import vscode from "vscode";
import { Device } from "../../../models/device";
import { UploadBlueprintNode } from "./upload-blueprint-node";

export class CommandsNode extends vscode.TreeItem {
  public readonly value: string = "";

  constructor(public readonly device: Device) {
    super("Commands", vscode.TreeItemCollapsibleState.Expanded);
  }

  getChildren() {
    return [new UploadBlueprintNode(this.device)];
  }

  getPropertyValue() {
    return this.value;
  }
}
