import { DeviceOnSiteNode } from "../providers/devices-on-site/nodes/device-on-site-node";
import { DevicesOnSiteService } from "../services/devices-on-site-service";

export const devicesConnect = (node: DeviceOnSiteNode, service: DevicesOnSiteService) => {
  return service.connectById(node.device.id);
};
