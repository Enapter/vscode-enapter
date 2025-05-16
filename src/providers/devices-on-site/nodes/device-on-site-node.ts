import vscode from "vscode";
import { Device, isDeviceOnline } from "../../../models/device";
import { OfflineIcon, OnlineIcon } from "../../../ui/icons";
import { PropertyNode } from "../../shared-nodes/property-node";

export class DeviceOnSiteNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    isActive: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(device.name, collapsibleState);
    const isOnline = isDeviceOnline(device);
    this.iconPath = isOnline ? new OnlineIcon() : new OfflineIcon();
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  setDescription(isActive: boolean) {
    this.description = isActive ? "(Active)" : undefined;
  }

  setContextValue(isActive: boolean) {
    this.contextValue = isActive ? "enapter.viewItems.ConnectedDevice" : "enapter.viewItems.Device";
  }

  getChildren() {
    return [
      new PropertyNode(`ID: ${this.device.id}`, this.device.id),
      new PropertyNode(`Slug: ${this.device.slug}`, this.device.slug),
    ];
  }
}
