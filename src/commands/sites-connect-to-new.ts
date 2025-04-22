import { SitesSelectTypeTask } from "../tasks/sites-select-type-task";
import { SiteType } from "../models/sites/site";
import { sitesConnectToCloudSite } from "./sites-connect-to-cloud-site";
import { sitesConnectToGatewaySite } from "./sites-connect-to-gateway-site";

export const sitesConnectToNew = async () => {
  try {
    const siteType = await SitesSelectTypeTask.run();

    if (siteType === SiteType.Cloud) {
      await sitesConnectToCloudSite();
    }

    if (siteType === SiteType.Gateway) {
      await sitesConnectToGatewaySite();
    }

    return true;
  } catch (_) {
    /* empty */
  }
};
