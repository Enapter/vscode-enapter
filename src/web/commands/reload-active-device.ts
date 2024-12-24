import { ExtState } from "../ext-state";
import { ApiClient } from "../api/client";

export const reloadActiveDevice = async () => {
  const state = ExtState.instance;
  const active = state.getActiveDevice();
  const api = new ApiClient();

  if (!active) {
    return;
  }

  const res = await api.getDeviceById(active?.id);

  if (!res?.device) {
    return;
  }

  void state.setActiveDevice(res.device);
};
