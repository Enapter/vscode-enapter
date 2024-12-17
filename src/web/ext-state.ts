import vscode, { ExtensionContext } from "vscode";

export class ExtState {
  private _onDidChangeDevices = new vscode.EventEmitter<void>();
  readonly onDidChangeDevices = this._onDidChangeDevices.event;

  constructor(private readonly context: ExtensionContext) {}

  async addRecentDeviceID(deviceID: string) {
    let recentDeviceIDs = this.get<string[]>("recentDeviceIDs") || [];

    if (recentDeviceIDs.includes(deviceID)) {
      recentDeviceIDs = recentDeviceIDs.filter((id) => id !== deviceID);
    }

    await this.update("recentDeviceIDs", [deviceID, ...recentDeviceIDs]);
    this._onDidChangeDevices.fire();
  }

  getRecentDevices() {
    return this.get<string[]>("recentDeviceIDs") || [];
  }

  get<T>(key: string): T | undefined {
    return this.state.get<T>(key);
  }

  update(key: string, value: any): Thenable<void> {
    return this.state.update(key, value);
  }

  private get state() {
    return this.context.workspaceState;
  }
}
