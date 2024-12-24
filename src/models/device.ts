import type { UUID } from "./shared";

type DeviceType = "standalone" | "gateway" | "hardware_ucm" | "lua";

export type Device = {
  id: UUID;
  blueprint_id: UUID;
  site_id: UUID;
  name: string;
  updated_at: Date;
  authorized_role: string;
  type: DeviceType;
};
