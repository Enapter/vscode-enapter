import { ExtState } from "../ext-state";

export const sitesDisconnect = async () => {
  const state = ExtState.getInstance();
  void state.disconnectFromActiveSite();
};
