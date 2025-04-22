import { faker } from "@faker-js/faker";

function generateSite() {
  return {
    id: faker.string.uuid(),
    name: faker.word.words({ count: { min: 2, max: 3 } }),
  };
}

export const getRandomSites = (count: number) => {
  return Array.from({ length: count }, generateSite);
};
