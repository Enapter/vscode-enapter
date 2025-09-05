import { Device } from "../models/device";
import vscode from "vscode";

export const devicesOpenInBrowser = (device: Device) => {
  const addressUri = vscode.Uri.parse(device.site.address);
  const uri = vscode.Uri.parse(`${addressUri.scheme}://${addressUri.authority}/ems/devices/${device.slug}`);
  return vscode.env.openExternal(uri);
};
