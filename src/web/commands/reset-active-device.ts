import { ExtState } from "../ext-state";

export const resetActiveDevice = () => {
  console.log("resetActiveDevice");
  const state = ExtState.instance;
  void state.clearActiveDevice();
};
