import { SitesConnectionsService } from "../services/sites-connections-service";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DevicesFetchSiteDevicesTask } from "../tasks/devices-fetch-site-devices-task";
import vscode from "vscode";
import { ViewIDs } from "../constants/views";
import { Logger } from "../logger";

export const sitesReloadDevices = async (
  sitesConnectionsService: SitesConnectionsService,
  devicesOnSiteService: DevicesOnSiteService,
) => {
  try {
    const site = sitesConnectionsService.getActive();

    if (!site) {
      return;
    }

    const response = await vscode.window.withProgress({ location: { viewId: ViewIDs.Devices.AllOnRemote } }, async () =>
      DevicesFetchSiteDevicesTask.run(site),
    );

    if (!response) {
      return;
    } else {
      const devices = devicesOnSiteService.getAll();

      await devicesOnSiteService.updateAll(
        response.devices.map((d) => {
          const device = devices.find((dev) => dev.id === d.id);

          if (device) {
            return {
              ...device,
              ...d,
            };
          }

          return d;
        }),
      );
    }

    return response.devices;
  } catch (e: unknown) {
    Logger.log(e);
  }
};
