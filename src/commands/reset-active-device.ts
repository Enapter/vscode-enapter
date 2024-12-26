import { ExtState } from "../ext-state";

export const resetActiveDevice = () => {
  const state = ExtState.instance;
  void state.clearActiveDevice();
};
