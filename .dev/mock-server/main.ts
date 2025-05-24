import { Hono } from "https://deno.land/x/hono@v3.12.0/mod.ts";
import { cors, logger } from "https://deno.land/x/hono@v3.12.0/middleware.ts";
import JSZip from "jszip";
import { getRandomDevices } from "./devices.ts";
import { faker } from "@faker-js/faker";
import { getRandomSites } from "./sites.ts";

const app = new Hono();

const delayMiddleware = (delay: number) => async (c: any, next: any) => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return next(c);
};

app.use("/*", cors());
app.use(logger());
app.use(delayMiddleware(1000));

const devices = getRandomDevices(10);
const sites = getRandomSites(1000);

const sitesDevices = (() => {
  return sites.map((s) => {
    return {
      ...s,
      devices: getRandomDevices(20).map((d) => ({
        ...d,
        site_id: s.id,
      })),
    };
  });
})();

app.get("/api/v3/site", (c) => {
  return c.json({ site: sitesDevices[0] });
});

app.get("/api/v3/sites", (c) => {
  const query = c.req.query();

  const signal = c.req.signal;

  if (signal.aborted) {
    console.log("Request aborted");
    return c.json({ error: "Request aborted" }, 499);
  }

  signal.addEventListener("abort", () => {
    console.log("Request aborted");
    return c.json({ error: "Request aborted" }, 499);
  });

  if (query.name && String(query.name).trim() !== "") {
    const filteredSites = sitesDevices.filter((site) => site.name.toLowerCase().includes(query.name.toLowerCase()));

    return c.json({ sites: filteredSites.slice(0, 50) });
  }

  return c.json({ sites: sitesDevices.slice(0, 2) });
});

app.get("/api/v3/sites/:id", (c) => {
  const site = sitesDevices.find((s) => s.id === c.req.param("id"));

  if (!site) {
    return c.text("Site not found", 404);
  }

  return c.json({
    site: {
      ...site,
      devices: site.devices.map((device) => ({
        ...device,
        site_id: site.id,
      })),
    },
  });
});

app.get("/api/v3/sites/:site_id/devices", (c) => {
  const site = sitesDevices.find((s) => s.id === c.req.param("site_id"));

  if (!site) {
    return c.text("Site not found", 404);
  }

  return c.json({
    devices: site.devices,
  });
});

app.get("/api/v3/devices", (c) => {
  return c.json({ devices: sitesDevices.flatMap((s) => s.devices) });
});

app.get("/api/v3/devices/:id", (c) => {
  const device = sitesDevices.flatMap((s) => s.devices).find((d) => d.id === c.req.param("id"));
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

app.get("/api/v3/devices/:id/connectivity_status", (c) => {
  return c.json({ status: faker.helpers.arrayElement(statuses) });
});

app.post("/api/v3/blueprints/upload", async (c) => {
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

app.post("/api/v3/devices/*/assign_blueprint", (c) => {
  return c.json({});
});

Deno.serve({ port: 6942 }, app.fetch);
console.log("Server running on port 6942");
