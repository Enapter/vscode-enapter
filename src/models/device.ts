import type { UUID } from "./shared";
import { Site } from "./sites/site";

type DeviceType = "standalone" | "lua" | string;

type DeviceProperties = {
  product_revision?: string;
  description?: string;
};

export interface Device {
  id: UUID;
  blueprint_id: UUID;
  site_id: UUID;
  name: string;
  updated_at: Date;
  authorized_role: string;
  type: DeviceType;
  properties?: DeviceProperties;
  connectivity_status?: string;
  site: Site;
  slug: string;
  isActive: boolean;
}

export const isSupportBlueprints = (device: Device) => {
  return String(device.type).toLowerCase() === "lua" || String(device.type).toLowerCase() === "standalone";
};

export const sortByOnlineStatus = (device: Device) => {
  if (device.connectivity_status) {
    return device.connectivity_status.toLowerCase() === "online" ? -1 : 1;
  }

  return 0;
};

export const sortByActiveDevice = (device: Device, activeDevice: Device | undefined) => {
  if (activeDevice) {
    return device.id === activeDevice.id ? -1 : 1;
  }

  return 0;
};

export const isDeviceOnline = (device: Device) => {
  return String(device.connectivity_status).toLowerCase() === "online";
};
