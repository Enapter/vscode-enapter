import vscode from "vscode";
import { LogChannel, VscodeLogChannel } from "./vscode-log-channel";
import { Device } from "../models/device";
import { WsConnection, WsConnectionFactory } from "../api/ws/connection";
import { ExtState } from "../ext-state";
import { DeviceLogEntry, toDeviceLog } from "../models/log-entries";
import { ExtContext } from "../ext-context";
import { ActiveDeviceService } from "../services/active-device-service";

export class DeviceLogsChannel implements vscode.Disposable {
  private static instance: DeviceLogsChannel | undefined;
  private connection: WsConnection | undefined;
  private isLogging: boolean = false;

  static getInstance(): DeviceLogsChannel {
    if (!DeviceLogsChannel.instance) {
      throw new Error("DeviceLogsChannel is not initialized.");
    }

    return DeviceLogsChannel.instance;
  }

  constructor(
    private readonly activeDeviceService: ActiveDeviceService,
    private readonly channel: LogChannel<DeviceLogEntry> = new VscodeLogChannel<DeviceLogEntry>(),
    private readonly wsConnectionFactory: WsConnectionFactory = new WsConnectionFactory(),
    private readonly extState: ExtState = ExtState.getInstance(),
  ) {
    this.activeDeviceService.onDidChangeDevice(() => this.disconnect());
    DeviceLogsChannel.instance = this;
  }

  disconnect(): void {
    this.connection?.dispose();
    this.connection = undefined;

    if (this.isLogging) {
      this.isLogging = false;
      this.updateLoggingState();
    }
  }

  async connect(device: Device): Promise<boolean> {
    this.disconnect();

    const token = await this.extState.getSiteApiToken(device.site);

    if (!token) {
      this.channel.error(`No API token found. Please set the API token for the site "${device.site.name}".`);
      return this.isLogging;
    }

    const url = this.buildWebSocketUrl(device);
    this.connection = this.wsConnectionFactory.createConnection(url, token);

    this.setupConnectionHandlers(this.connection, device);
    this.revealPanel();

    if (!this.isLogging) {
      this.isLogging = true;
      this.updateLoggingState();
    }

    return this.isLogging;
  }

  revealPanel() {
    this.channel.revealPanel();
  }

  private buildWebSocketUrl(device: Device): string {
    return `${device.site.address}/v3/sites/${device.site.id}/devices/${device.id}/logs`.replace(
      /http(s?):\/\//,
      (match) => match.replace("http", "ws"),
    );
  }

  private setupConnectionHandlers(connection: WsConnection, device: Device): void {
    connection.onOpen(() => this.handleConnectionOpen(device));
    connection.onError((e) => this.handleConnectionError(e));
    connection.onMessage((data) => this.handleConnectionMessage(data));
    connection.onClose(() => this.handleConnectionClose());
    connection.onPing(() => this.handleConnectionPing())
  }

  private handleConnectionOpen(device: Device): void {
    this.channel.info(`Connected to device (ID: ${device.id}).`);
  }

  private handleConnectionError(e: Error): void {
    this.channel.error(`Unable to connect to the device logs. ${e}`);
  }

  private handleConnectionMessage(data: unknown): void {
    const logEntry = toDeviceLog(data);

    if (!logEntry) {
      this.channel.error(`Unable to parse log entry. ${(data as ArrayBuffer).toString()}`);
      return;
    }

    this.channel.log(logEntry);
  }

  private handleConnectionClose(): void {
    this.channel.info("Connection closed.");

    if (this.isLogging) {
      this.isLogging = false;
      this.updateLoggingState();
    }
  }

  private handleConnectionPing(): void {
    this.channel.debug("Ping received from the server");
  }

  dispose(): void {
    this.disconnect();
    this.channel.dispose();
    DeviceLogsChannel.instance = undefined;
  }

  private updateLoggingState(): void {
    ExtContext.getInstance().setDeviceLoggingState(this.isLogging);
  }
}
