import type { UUID } from "./shared";

type DeviceType = "standalone" | "lua" | string;

type DeviceProperties = {
  product_revision?: string;
  description?: string;
};

export type Device = {
  id: UUID;
  blueprint_id: UUID;
  site_id: UUID;
  name: string;
  updated_at: Date;
  authorized_role: string;
  type: DeviceType;
  properties?: DeviceProperties;
};

export const isSupportBlueprints = (device: Device) => {
  return device.type === "lua" || device.type === "standalone";
};
