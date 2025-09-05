import { RawData, WebSocket } from "ws";
import { WsConnection } from "./connection";

export class NodeWsConnection implements WsConnection<RawData> {
  private readonly connection: WebSocket;

  constructor(
    public readonly url: string,
    apiToken: string,
  ) {
    this.connection = new WebSocket(url, {
      headers: { "X-Enapter-Auth-Token": apiToken },
      rejectUnauthorized: false,
    });
  }

  close() {
    this.connection.close();
    this.connection.terminate();
    this.connection.removeAllListeners();
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

  onMessage(callback: (data: RawData) => void) {
    this.connection.on("message", callback);
  }

  onPing(callback: () => void) {
    this.connection.on("ping", callback);
  }

  dispose() {
    this.close();
  }
}
