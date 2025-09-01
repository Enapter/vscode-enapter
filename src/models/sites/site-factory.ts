import { CloudSite } from "./cloud-site";
import { GatewaySite } from "./gateway-site";
import { Logger } from "../../logger";
import { Site, SiteType } from "./site";

export class SiteFactory {
  static createCloudSite(id: string, name: string, isActive: boolean = false): CloudSite {
    return new CloudSite(id, name, isActive);
  }

  static createGatewaySite(id: string, name: string, address: string, isActive: boolean = false): GatewaySite {
    return new GatewaySite(id, name, address, isActive);
  }

  static deserialize(serialized: string): Site | undefined {
    try {
      const data = JSON.parse(serialized);

      switch (data.type) {
        case SiteType.Cloud:
          return CloudSite.deserialize(serialized);
        case SiteType.Gateway:
          return GatewaySite.deserialize(serialized);
        default:
          return undefined;
      }
    } catch (error) {
      Logger.log("Failed to deserialize site", error);
      return undefined;
    }
  }
}
