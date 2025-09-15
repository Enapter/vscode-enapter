import vscode from "vscode";
import { Device, isDeviceOnline } from "../../../models/device";
import { OfflineIcon, OnlineIcon } from "../../../ui/icons";
import { PropertyNode } from "../../shared-nodes/property-node";
import { DeleteDeviceNode } from "./delete-device-node";
import { DownloadBlueprintNode } from "./download-blueprint-node";

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
      new PropertyNode(`Slug: ${this.device.slug}`, this.device.slug),
      new PropertyNode(`ID: ${this.device.id}`, this.device.id),
      new PropertyNode(`Blueprint ID: ${this.device.blueprint_id}`, this.device.blueprint_id),
      new DownloadBlueprintNode(this.device),
      new DeleteDeviceNode(this.device),
    ];
  }
}
