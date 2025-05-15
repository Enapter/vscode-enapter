import { WebSocket } from "ws";
import { WsConnection } from "./connection";

export class NodeWsConnection implements WsConnection<WebSocket.RawData> {
  private readonly connection: WebSocket;

  constructor(
    public readonly url: string,
    apiToken: string,
  ) {
    this.connection = new WebSocket(url, { headers: { "X-Enapter-Auth-Token": apiToken } });
  }

  close() {
    this.connection.close();
  }

  onOpen(callback: () => void) {
    this.connection.on("open", callback);
  }

  onClose(callback: () => void) {
    this.connection.on("close", callback);
  }

  onError(callback: (error: Error) => void) {
    this.connection.on("error", callback);
  }

  onMessage(callback: (data: WebSocket.RawData) => void) {
    this.connection.on("message", callback);
  }

  dispose() {
    this.close();
  }
}
