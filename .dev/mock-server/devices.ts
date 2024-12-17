import { faker } from "npm:@faker-js/faker@9.3.0";

const deviceTypes = ["standalone", "gateway", "hardware_ucm", "lua"] as const;

function generateDevice() {
  return {
    id: faker.string.uuid(),
    blueprint_id: faker.string.uuid(),
    site_id: faker.string.uuid(),
    name: faker.word.words({ count: { min: 2, max: 3 } }),
    updated_at: faker.date.recent(),
    authorized_role: faker.helpers.arrayElement(["installer", "user"]),
    type: faker.helpers.arrayElement(deviceTypes),
  };
}

export function getRandomDevices(count: number) {
  return Array.from({ length: count }, generateDevice);
}
