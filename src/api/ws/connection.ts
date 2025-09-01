import vscode from "vscode";
import { NodeWsConnection } from "./node-ws-connection";

export interface WsConnection<TData = unknown> extends vscode.Disposable {
  url: string;
  close: () => void;
  onOpen: (callback: () => void) => void;
  onClose: (callback: () => void) => void;
  onError: (callback: (error: Error) => void) => void;
  onMessage: (callback: (data: TData) => void) => void;
  onPing: (callback: () => void) => void;
}

export class WsConnectionFactory {
  createConnection(url: string, host: string): WsConnection {
    return new NodeWsConnection(url, host);
  }
}
