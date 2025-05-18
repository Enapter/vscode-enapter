import { ExtState } from "../ext-state";
import { ApiClient } from "../api/client";
import { ActiveDeviceService } from "../services/active-device-service";

export const reloadActiveDevice = async (service: ActiveDeviceService) => {
  const state = ExtState.getInstance();
  const active = service.getDevice();

  if (!active) {
    return;
  }

  const site = state.getActiveSite();

  if (!site) {
    return;
  }

  const api = await ApiClient.forSite(site);

  if (!api) {
    return;
  }

  const res = await api.getDeviceById(active?.id);

  if (!res?.device) {
    return;
  }

  return service.updateDevice(res.device);
};
