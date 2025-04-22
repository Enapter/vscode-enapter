import { ExtState } from "../ext-state";

export const sitesRemoveCloudApiToken = async () => {
  const extState = ExtState.getInstance();
  return extState.deleteCloudApiToken();
};
