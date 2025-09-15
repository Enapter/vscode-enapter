import vscode from "vscode";
import { DownloadBlueprintIcon } from "../../../ui/icons";
import { CommandIDs } from "../../../constants/commands";
import { Device } from "../../../models/device";

export class DownloadBlueprintNode extends vscode.TreeItem {
  iconPath = new DownloadBlueprintIcon();

  command = {
    title: "Download Blueprint",
    command: CommandIDs.Devices.DownloadBlueprint,
    arguments: [this.device],
  } satisfies vscode.Command;

  constructor(public readonly device: Device) {
    super("Download Blueprint");
  }
}
