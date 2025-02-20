import { compile } from "json-schema-to-typescript";
import fs from "node:fs";

const OUTPUT_DIR = "./src/models/manifests/schemas";

const definitions = [
  {
    version: 1,
    name: "v1",
    url: "https://cloud.enapter.com/schemas/json-schemas/blueprints/device/v1/schema.json",
  },
  {
    version: 3,
    name: "v3",
    url: "https://cloud.enapter.com/schemas/json-schemas/blueprints/device/v3/schema.json",
  },
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

definitions.forEach((definition) => {
  fetch(definition.url)
    .then((res) => res.json())
    .then((schema) => {
      compile(schema, definition.name, { bannerComment: "" }).then((ts) => {
        fs.writeFileSync(`${OUTPUT_DIR}/${definition.name}.ts`, ts);
      });
    });
});
