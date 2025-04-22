import { ExtState } from "../ext-state";

export const sitesDisconnectAll = async () => {
  const extState = ExtState.getInstance();
  await extState.disconnectAllSites();
};
