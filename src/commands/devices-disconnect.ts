import { ExtState } from "../ext-state";

export const devicesDisconnect = () => {
  const state = ExtState.getInstance();
  return state.clearActiveDevice();
};
