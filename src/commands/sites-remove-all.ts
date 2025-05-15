import { ExtState } from "../ext-state";

export const sitesRemoveAll = async () => {
  const extState = ExtState.getInstance();
  await extState.removeAllSites();
};
