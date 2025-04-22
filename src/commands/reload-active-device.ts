import { ExtState } from "../ext-state";
import { ApiClient } from "../api/client";

export const reloadActiveDevice = async () => {
  const state = ExtState.getInstance();
  const active = state.getActiveDevice();

  if (!active) {
    return;
  }

  const site = state.getActiveSite()

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

  void state.setActiveDevice(res.device);
};
