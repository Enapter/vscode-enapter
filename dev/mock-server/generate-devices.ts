import { faker } from "@faker-js/faker";
import { $ } from "bun";

const sites = await Bun.file("./generated/sites.json").json();
const deviceTypes = ["standalone", "gateway", "hardware_ucm", "lua"] as const;
const devices = [];

for (const site of sites) {
  for (let i = 0; i < 20; i++) {
    devices.push({
      id: Bun.randomUUIDv7(),
      blueprint_id: Bun.randomUUIDv7(),
      name: `${faker.food.dish()} ${faker.company.buzzPhrase()}`,
      slug: faker.helpers.slugify(faker.word.words({ count: { min: 2, max: 4 } })).replace(/-+/gi, "-"),
      type: faker.helpers.arrayElement(deviceTypes),
      updated_at: faker.date.recent(),
      authorized_role: faker.helpers.arrayElement(["installer", "user"]),
      connectivity: {
        status: faker.helpers.arrayElement(["online", "offline", undefined])
      },
      site_id: site.id
    });
  }
}

await Bun.write("./generated/devices.json", JSON.stringify(devices));
await $`bunx prettier --write ./generated/devices.json`;
