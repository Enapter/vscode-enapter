import vscode from "vscode";
import { DirectRunCommandOnClickIcon } from "../../../ui/icons";
import { CommandIDs } from "../../../constants/commands";
import { Device } from "../../../models/device";

export class UploadBlueprintNode extends vscode.TreeItem {
  iconPath = new DirectRunCommandOnClickIcon();

  command = {
    title: "Upload Blueprint",
    command: CommandIDs.Devices.UploadBlueprint,
    arguments: [this],
  } satisfies vscode.Command;

  constructor(public readonly device: Device) {
    super("Upload Blueprint");
  }
}
