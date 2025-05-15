import vscode from "vscode";
import { Device } from "../../../models/device";
import { ExtContext } from "../../../ext-context";
import { OfflineIcon, OnlineIcon } from "../../../ui/icons";
import { ActiveDeviceProvider } from "../active-device-provider";

export class LogsNode extends vscode.TreeItem {
  constructor(
    private readonly provider: ActiveDeviceProvider,
    public readonly device: Device,
    private readonly extContext: ExtContext = ExtContext.getInstance(),
  ) {
    super("Logs");
    this.contextValue = "enapter.viewItems.ActiveDevice.LogsNode";
    this.setDescription(this.extContext.getIsDeviceLogging());
    this.setIcon(this.extContext.getIsDeviceLogging());
    this.extContext.onDidChangeDeviceLoggingState((isLogging) => this.refresh(isLogging));
  }

  refresh(isLogging: boolean) {
    this.setDescription(isLogging);
    this.setIcon(isLogging);
    this.provider.refresh(this);
  }

  setDescription(isLogging: boolean) {
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
}
