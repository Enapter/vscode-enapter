import { ApiClient } from "../api/client";
import { ActiveDeviceService } from "../services/active-device-service";
import { SitesConnectionsService } from "../services/sites-connections-service";
import vscode from "vscode";
import { Logger } from "../logger";

export const reloadActiveDevice = async (
  activeDeviceService: ActiveDeviceService,
  sitesConnectionsService: SitesConnectionsService,
) => {
  const active = activeDeviceService.getDevice();

  if (!active) {
    return;
  }

  const site = sitesConnectionsService.getById(active.site_id);

  if (!site) {
    return;
  }

  const api = await ApiClient.forSite(site);

  if (!api) {
    return;
  }

  try {
    const res = await api.getDeviceById(site.id, active.id);

    if (!res?.device) {
      return;
    }

    return activeDeviceService.updateDevice({
      ...active,
      ...res.device,
    });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "status" in e && String(e.status) === "404") {
      await activeDeviceService.replaceDevice(undefined);
      vscode.window.showInformationMessage("The active device was not found and was disconnected.");
    } else {
      vscode.window.showErrorMessage("An error occurred while reloading the active device.");
    }

    Logger.log(e);
  }
};
