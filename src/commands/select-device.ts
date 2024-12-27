import vscode, { QuickPickItemKind, ThemeIcon } from "vscode";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";
import { Device } from "../models/device";
import { ExtState } from "../ext-state";

function isPresent(s: string | undefined): s is string {
  return !!s && s.length > 0;
}

function getDetail(device: Device): string | undefined {
  if (!device.properties) {
    return undefined;
  }

  const description = device.properties.description;
  const revision = device.properties.product_revision;

  if (isPresent(description)) {
    return description;
  }

  if (isPresent(revision)) {
    return revision;
  }
}

function getDevicesPicks(devicesList: Device[]) {
  const state = ExtState.instance;
  const list = [];

  const recentDevice = state.getRecentDevices()[0];
  const recentDeviceInList = devicesList.find((d) => d.id === recentDevice.id);

  if (recentDeviceInList) {
    list.push({ label: "Recent", kind: QuickPickItemKind.Separator });
    list.push({
      label: recentDeviceInList.name,
      detail: getDetail(recentDeviceInList),
      description: recentDeviceInList.id,
    });
  }

  const filtered = devicesList.filter((d) => {
    if (!recentDeviceInList) {
      return true;
    }

    return d.id !== recentDeviceInList.id;
  });

  if (filtered.length === 0) {
    return list;
  }

  if (recentDeviceInList) {
    list.push({
      label: "Other Devices",
      kind: QuickPickItemKind.Separator,
    });
  }

  filtered.forEach((d) => {
    list.push({
      label: d.name,
      description: d.id,
      detail: getDetail(d),
    });
  });

  return list;
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
