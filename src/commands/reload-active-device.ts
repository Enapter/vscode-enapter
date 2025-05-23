import { ApiClient } from "../api/client";
import { ActiveDeviceService } from "../services/active-device-service";
import { SitesConnectionsService } from "../services/sites-connections-service";

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

  const res = await api.getDeviceById(site.id, active.id);

  if (!res?.device) {
    return;
  }

  return activeDeviceService.updateDevice({
    ...active,
    ...res.device,
  });
};
