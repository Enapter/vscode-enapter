import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { DeviceOnSiteNode } from "../providers/devices-on-site/nodes/device-on-site-node";

export const devicesDisconnect = (node: DeviceOnSiteNode, service: DevicesOnSiteService) => {
  return service.disconnectById(node.device.id);
};
