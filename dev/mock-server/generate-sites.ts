import { faker } from "@faker-js/faker";
import { $ } from "bun";

function generateSite() {
  return {
    id: Bun.randomUUIDv7(),
    name: `${faker.book.title()} ${faker.music.songName()}`
  };
}

const sites = [];

for (let i = 0; i < 10; i++) {
  sites.push(generateSite());
}

Bun.write("./generated/sites.json", JSON.stringify(sites));
await $`bunx prettier --write ./generated/sites.json`;
