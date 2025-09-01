import sites from "./generated/sites.json";
import devices from "./generated/devices.json";

const server = Bun.serve({
  port: 6942,
  routes: {
    "/api/v3/site": async () => {
      return Response.json({ site: sites[0] });
    },
    "/api/v3/sites/:site_id": async (req) => {
      return Response.json({ site: sites.find((s) => s.id === req.params.site_id) });
    },
    "/api/v3/sites/:site_id/devices": async (req) => {
      return Response.json({ devices: devices.filter((d) => d.site_id === req.params.site_id) });
    },
    "/api/v3/devices": async (req) => {
      return Response.json({ devices: devices.filter((d) => d.site_id === req.params.site_id) });
    },
    "/api/v3/sites/:site_id/devices/:device_id": async (req) => {
      return Response.json({ device: devices.find((d) => d.id === req.params.device_id) });
    },
    "/api/v3/devices/:device_id": async (req) => {
      return Response.json({ device: devices.find((d) => d.id === req.params.device_id) });
    },
    "/api/v3/sites/:site_id/devices/:device_id/logs": async (req, server) => {
      const { site_id, device_id } = req.params;
      if (server.upgrade(req, { data: { site_id, device_id } })) return;
      return new Response("Expected WebSocket", { status: 400 });
    }
  },
  websocket: {
    open: (ws) => {
      console.log("WebSocket connection opened", ws.data);
      const now = () => new Date().toISOString();
      const id = `site:${ws.data.site_id}::device:${ws.data.device_id}::logs`;
      const message = () => ({ severity: "warning", message: now(), data: `data: ${now()}` });
      ws.send(`Connected to ID ${id}`);
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
    sendPings: true
  }
});

console.log(`Listening on ${server.hostname}:${server.port}`);
