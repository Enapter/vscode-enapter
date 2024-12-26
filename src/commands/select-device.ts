import vscode from "vscode";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";
import { Device } from "../models/device";

function getDevicesPicks(devicesList: Array<{ id: string; name: string }>) {
  return devicesList.map((d) => {
    return {
      label: d.name,
      detail: `ID: ${d.id}`,
    };
  });
}

export async function selectDevice(): Promise<Device | undefined> {
  const logger = Logger.getInstance();
  logger.group("Upload Blueprint");

  try {
    const client = new ApiClient();
    const devices = await client.getDevicesSupportBlueprints();

    const chosen = await vscode.window.showQuickPick(getDevicesPicks(devices), {
      placeHolder: "Choose a device to upload the blueprint to",
    });

    if (!chosen) {
      return;
    }

    return devices.find((d) => d.name === chosen?.label);
  } catch (e) {
    logger.log(e);
    vscode.window.showErrorMessage("Failed to select a device");
  } finally {
    logger.groupEnd();
  }
}
