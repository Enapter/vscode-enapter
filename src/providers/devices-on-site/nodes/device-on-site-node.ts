import vscode from "vscode";
import { Device, isDeviceOnline } from "../../../models/device";
import { OfflineIcon, OnlineIcon } from "../../../ui/icons";
import { PropertyNode } from "../../shared-nodes/property-node";

export class DeviceOnSiteNode extends vscode.TreeItem {
  constructor(
    public readonly device: Device,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(device.name, collapsibleState);
    const isOnline = isDeviceOnline(device);
    this.iconPath = isOnline ? new OnlineIcon() : new OfflineIcon();
    this.setContextValue();
    this.setDescription();
  }

  setDescription() {
    this.description = this.device.isActive ? "(Active)" : undefined;
  }

  setContextValue() {
    this.contextValue = this.device.isActive ? "enapter.viewItems.ConnectedDevice" : "enapter.viewItems.Device";
  }

  getChildren() {
    return [
      new PropertyNode(`ID: ${this.device.id}`, this.device.id),
      new PropertyNode(`Slug: ${this.device.slug}`, this.device.slug),
    ];
  }
}
