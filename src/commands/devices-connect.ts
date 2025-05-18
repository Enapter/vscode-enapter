import { DeviceOnSiteNode } from "../providers/devices-on-site/nodes/device-on-site-node";
import { ActiveDeviceService } from "../services/active-device-service";

export const devicesConnect = (service: ActiveDeviceService, node: DeviceOnSiteNode) => {
  return service.updateDevice(node.device);
};
