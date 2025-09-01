import { DevicesOnSiteService } from "../services/devices-on-site-service";
import { Device } from "../models/device";

export const devicesDisconnect = (device: Device, service: DevicesOnSiteService) => {
  return service.disconnectById(device.id);
};
