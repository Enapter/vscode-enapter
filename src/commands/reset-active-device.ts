import { ActiveDeviceService } from "../services/active-device-service";

export const resetActiveDevice = (service: ActiveDeviceService) => {
  return service.replaceDevice(undefined);
};
