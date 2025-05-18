import { ActiveDeviceService } from "../services/active-device-service";

export const devicesDisconnect = (service: ActiveDeviceService) => {
  return service.updateDevice(undefined);
};
