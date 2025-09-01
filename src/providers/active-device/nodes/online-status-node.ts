import vscode from "vscode";
import { Device } from "../../../models/device";
import { OfflineIcon, OnlineIcon } from "../../../ui/icons";

export class OnlineStatusNode extends vscode.TreeItem {
  constructor(device: Device) {
    const isOnline = String(device.connectivity?.status).toLowerCase() === "online";
    const label = isOnline ? "Online" : "Offline";
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "enapter.viewItems.PropertyNode";
    this.iconPath = isOnline ? new OnlineIcon() : new OfflineIcon();
  }
}
