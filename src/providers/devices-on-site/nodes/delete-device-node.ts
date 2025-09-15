import vscode from "vscode";
import { DeleteDeviceIcon } from "../../../ui/icons";
import { CommandIDs } from "../../../constants/commands";
import { Device } from "../../../models/device";

export class DeleteDeviceNode extends vscode.TreeItem {
  iconPath = new DeleteDeviceIcon();

  command = {
    title: "Delete Device",
    command: CommandIDs.Devices.Delete,
    arguments: [this.device],
  } satisfies vscode.Command;

  constructor(public readonly device: Device) {
    super("Delete Device");
  }
}
