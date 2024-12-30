import { Hono } from "https://deno.land/x/hono@v3.12.0/mod.ts";
import { cors, logger } from "https://deno.land/x/hono@v3.12.0/middleware.ts";
import JSZip from "jszip";
import { getRandomDevices } from "./devices.ts";
import { faker } from "@faker-js/faker";

const app = new Hono();

app.use("/*", cors());
app.use(logger());

const devices = getRandomDevices(10);

app.get("/v3/devices", (c) => {
  return c.json({ devices });
});

app.get("/v3/devices/:id", (c) => {
  const device = devices.find((d) => d.id === c.req.param("id"));
  if (!device) {
    return c.text("Device not found", 404);
  }
  return c.json({
    device: {
      ...device,
      site_id: faker.string.uuid(),
    },
  });
});

const statuses = ["online", "offline", "unknown"];

app.get("/v3/devices/:id/connectivity_status", (c) => {
  return c.json({ status: faker.helpers.arrayElement(statuses) });
});

app.post("/v3/blueprints/upload", async (c) => {
  try {
    const body = await c.req.arrayBuffer();
    const zipData = new Uint8Array(body);
    const tempFile = await Deno.makeTempFile();
    await Deno.writeFile(tempFile, zipData);
    const zip = new JSZip();
    const content = await zip.loadAsync(zipData);

    const localTime = new Date().toLocaleTimeString();
    console.log(`\nReceived ZIP at ${localTime}`);
    console.log("\nReceived ZIP containing:");
    for (const [filename, _] of Object.entries(content.files)) {
      console.log(`- ${filename}`);
    }

    await Deno.remove(tempFile);

    return c.json({ blueprint: { id: faker.string.uuid() } });
  } catch (error) {
    console.error("Error processing ZIP:", error);
    return c.text("Invalid ZIP file", 400);
  }
});

app.post("/v3/devices/*/assign_blueprint", (c) => {
  return c.json({});
});

Deno.serve({ port: 6942 }, app.fetch);
console.log("Server running on port 6942");
