import vscode from "vscode";
import { DeviceTreeItemProperty, RecentDevicesTreeItem } from "../recent-devices-provider";

export const copyDeviceProperty = (node: DeviceTreeItemProperty) => {
  vscode.env.clipboard.writeText(node.getPropertyValue());
};
