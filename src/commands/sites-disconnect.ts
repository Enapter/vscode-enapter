import { CloudSiteNode } from "../providers/sites-connections/nodes/cloud-site-node";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";
import { SitesConnectionsService } from "../services/sites-connections-service";
import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { ActiveDeviceService } from "../services/active-device-service";

export const sitesDisconnect = async (
  node: CloudSiteNode | GatewayNode,
  sitesConnectionsService: SitesConnectionsService,
  devicesOnSiteService: DevicesOnSiteService,
  activeDeviceService: ActiveDeviceService,
) => {
  await sitesConnectionsService.disconnectById(node.site.id);
  await activeDeviceService.updateDevice(undefined);
  await devicesOnSiteService.replaceAll([]);
};
