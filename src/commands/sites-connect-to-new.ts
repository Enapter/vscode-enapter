import { SitesSelectTypeTask } from "../tasks/sites-select-type-task";
import { SiteType } from "../models/sites/site";
import { sitesConnectToCloudSite } from "./sites-connect-to-cloud-site";
import { sitesConnectToGatewaySite } from "./sites-connect-to-gateway-site";
import { SitesConnectionsService } from "../services/sites-connections-service";

export const sitesConnectToNew = async (service: SitesConnectionsService) => {
  try {
    const siteType = await SitesSelectTypeTask.run();

    if (siteType === SiteType.Cloud) {
      await sitesConnectToCloudSite(service);
    }

    if (siteType === SiteType.Gateway) {
      await sitesConnectToGatewaySite(service);
    }

    return true;
  } catch (_) {
    /* empty */
  }
};
