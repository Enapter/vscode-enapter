import { SitesConnectionsService } from "../services/sites-connections-service";

export const sitesRemoveAll = async (service: SitesConnectionsService) => {
  return service.updateAll([]);
};
