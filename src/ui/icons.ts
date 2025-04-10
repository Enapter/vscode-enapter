import vscode from "vscode";
import { GreenColor, OfflineIndicatorColor } from "./colors";
import { Device, isOnline } from "../models/device";

export class OnlineIcon extends vscode.ThemeIcon {
  constructor() {
    super("circle-filled", new GreenColor());
  }
}

export class OfflineIcon extends vscode.ThemeIcon {
  constructor() {
    super("circle-filled", new OfflineIndicatorColor());
  }
}

export class DeviceStatusIcon extends vscode.ThemeIcon {
  constructor(device: Device) {
    const icon = isOnline(device) ? new OnlineIcon() : new OfflineIcon();
    super(icon.id, icon.color);
  }
}
