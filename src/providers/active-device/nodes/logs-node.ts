import vscode from "vscode";
import { Device, isDeviceOnline } from "../../../models/device";
import { ExtContext } from "../../../ext-context";
import { OfflineIcon, OnlineIcon } from "../../../ui/icons";
import { ActiveDeviceProvider } from "../provider";

export class LogsNode extends vscode.TreeItem {
  constructor(
    private readonly provider: ActiveDeviceProvider,
    public readonly device: Device,
    private readonly extContext: ExtContext = ExtContext.getInstance(),
  ) {
    super("Logs");
    this.contextValue = "enapter.viewItems.ActiveDevice.LogsNode";
    this.setDescription(this.isLogging);
    this.setIcon(this.isLogging);
    this.extContext.onDidChangeDeviceLoggingState((isLogging) => this.refresh(isLogging));
  }

  refresh(isLogging: boolean) {
    this.setDescription(isLogging);
    this.setIcon(isLogging);
    this.provider.refresh(this);
  }

  setDescription(isLogging: boolean) {
    if (!this.isOnline) {
      this.description = "(Device offline)";
      return;
    }

    if (isLogging) {
      this.description = "(Streaming)";
    } else {
      this.description = "(Stopped)";
    }
  }

  setIcon(isLogging: boolean) {
    if (isLogging) {
      this.iconPath = new OnlineIcon();
    } else {
      this.iconPath = new OfflineIcon();
    }
  }

  get isLogging() {
    return this.extContext.getIsDeviceLogging();
  }

  get isOnline() {
    return isDeviceOnline(this.device);
  }
}
