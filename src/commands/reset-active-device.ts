import { ExtState } from "../ext-state";

export const resetActiveDevice = () => {
  const state = ExtState.getInstance();
  void state.clearActiveDevice();
};
