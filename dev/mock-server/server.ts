import sites from "./generated/sites.json";
import devices from "./generated/devices.json";
import JSZip from "jszip";
import { faker } from "@faker-js/faker";

const server = Bun.serve({
  port: 6942,
  routes: {
    "/api/v3/blueprints/upload": {
      POST: async (req) => {
        try {
          console.group("\n/api/v3/blueprints/upload");
          const body = await req.arrayBuffer();
          const zipData = new Uint8Array(body);
          const zip = new JSZip();
          const content = await zip.loadAsync(zipData);
          const now = new Date().toLocaleTimeString();
          console.log(`Received ZIP at ${now}`);
          console.log("Received ZIP containing:");
          Object.entries(content.files).forEach(([f, _]) => console.log(`- ${f}`));
          return Response.json({ blueprint: { id: crypto.randomUUID() } });
        } catch (e) {
          console.error(e);
          return new Response("Invalid ZIP file", { status: 400 });
        } finally {
          console.log("\n");
          console.groupEnd();
        }
      },
    },
    "/api/v3/devices/:device_id/assign_blueprint": {
      POST: async () => {
        return Response.json({});
      },
    },
    "/api/v3/site": async () => {
      return Response.json({ site: sites[0] });
    },
    "/api/v3/sites/:site_id": async (req) => {
      return Response.json({ site: sites.find((s) => s.id === req.params.site_id) });
    },
    "/api/v3/sites/:site_id/devices": async (req) => {
      return Response.json({ devices: devices.filter((d) => d.site_id === req.params.site_id) });
    },
    "/api/v3/devices": async () => {
      return Response.json({ devices: devices.filter((d) => d.site_id === sites[0]!.id) });
    },
    "/api/v3/sites/:site_id/devices/:device_id": {
      GET: async (req) => {
        return Response.json({ device: devices.find((d) => d.id === req.params.device_id) });
      },
      DELETE: async (req) => {
        console.log(`Deleting device ${req.params.device_id} from site ${req.params.site_id}`);
        return Response.json({}, { status: 200 });
      },
    },
    "/api/v3/devices/:device_id": async (req) => {
      // return Response.json({ errors: [{ message: faker.lorem.sentences(2) }] }, { status: 404 });
      return Response.json({ device: devices.find((d) => d.id === req.params.device_id) });
    },
    "/api/v3/sites/:site_id/devices/:device_id/logs": async (req, server) => {
      const { site_id, device_id } = req.params;
      if (server.upgrade(req, { data: { site_id, device_id } })) return;
      return new Response("Expected WebSocket", { status: 400 });
    },
    "/api/v3/blueprints/:blueprint_id/zip": async (req) => {
      const { searchParams } = new URL(req.url);
      const view = searchParams.get("view") as "ORIGINAL" | "COMPILED" | null;
      const zipContent = JSON.stringify(req);
      const zipper = new JSZip();

      zipper
        .folder("blueprint")!
        .file("content.json", zipContent)
        .file(view || "no_view", `This is a mock ZIP file for view: ${view || "none"}`);

      return new Response(await zipper.generateAsync({ type: "uint8array" }), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
        },
      });
    },
  },
  websocket: {
    open: (ws) => {
      console.log("WebSocket connection opened", ws.data);
      const now = () => new Date().toISOString();
      const id = `site:${(ws.data as any).site_id}::device:${(ws.data as any).device_id}::logs`;
      const message = () => ({ severity: "warning", message: now(), data: `data: ${now()}` });
      ws.send(JSON.stringify({ severity: "info", message: `Connected to ID ${id}`, data: `Connected to ID ${id}` }));
      setInterval(() => ws.ping(), 5000);
      setInterval(() => ws.send(JSON.stringify(message())), 1000);
    },
    close: () => {
      console.log("WebSocket connection closed");
    },
    message: async (ws, message) => {
      console.log("Client connected", JSON.stringify(ws.data), message);
      ws.send("Welcome to the mock server!");
    },
    pong: (ws) => {
      console.log("Pong received from client", JSON.stringify(ws.data));
    },
    sendPings: true,
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
