import vscode from "vscode";
import { Device } from "../../../models/device";
import { UploadBlueprintNode } from "./upload-blueprint-node";
import { DeleteDeviceNode } from "./delete-device-node";
import { DownloadBlueprintNode } from "./download-blueprint-node";

export class ActionsNode extends vscode.TreeItem {
  public readonly value: string = "";

  constructor(public readonly device: Device) {
    super("Actions", vscode.TreeItemCollapsibleState.Expanded);
  }

  getChildren() {
    return [
      new UploadBlueprintNode(this.device),
      new DownloadBlueprintNode(this.device),
      new DeleteDeviceNode(this.device),
    ];
  }

  getPropertyValue() {
    return this.value;
  }
}
