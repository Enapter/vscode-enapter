import { Device } from "../models/device";
import { ActiveDeviceService } from "../services/active-device-service";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { ApiClient } from "../api/client";
import { SitesConnectionsService } from "../services/sites-connections-service";
import { sitesReloadDevices } from "./sites-reload-devices";
import vscode from "vscode";

export const devicesDelete = async (
  device: Device,
  sitesConnectionsService: SitesConnectionsService,
  activeDeviceService: ActiveDeviceService,
  devicesOnSiteService: DevicesOnSiteService,
) => {
  const userResponse = await vscode.window.showWarningMessage(
    "Are you sure you want to delete this device? This action cannot be undone.",
    { modal: true },
    "Yes",
    "No",
  );

  if (userResponse !== "Yes") {
    return;
  }

  const activeSite = sitesConnectionsService.getActive();

  if (!activeSite) {
    return;
  }

  const apiClient = await ApiClient.forSite(activeSite);
  await apiClient.deleteDeviceById(activeSite.id, device.id);

  if (device.id === activeDeviceService.getDevice()?.id) {
    await activeDeviceService.replaceDevice(undefined);
    await devicesOnSiteService.disconnectById(device.id);
  }

  await sitesReloadDevices(sitesConnectionsService, devicesOnSiteService);
};
