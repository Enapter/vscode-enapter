import vscode, { CancellationToken, WebviewView, WebviewViewResolveContext } from "vscode";
import { ExtState } from "./ext-state";
import { Device } from "./models/device";
import { Logger } from "./logger";
import { CommandID, CommandIDs } from "./constants/commands";
import { getNonce } from "./utils/get-nonce";
import { ExtSettings } from "./ext-settings";
import { ApiClient } from "./api/client";

export class ActiveDeviceWebview implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private readonly extensionUri: vscode.Uri;
  private readonly state: ExtState;
  private readonly nonce = getNonce();
  private readonly extSettings = ExtSettings.instance;
  private disposables: vscode.Disposable[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {
    this.extensionUri = context.extensionUri;
    this.state = ExtState.instance;
    this.state.onDidChangeActiveDevice((d) => this.postDeviceChanged(d));

    this.disposables.push(
      this.extSettings.onDidChangeSettings(() => {
        this.postSettingsChanged();
      }),
    );
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }

  postDeviceChanged(device: Device | undefined) {
    if (!this.view) {
      return;
    }

    void this.view.webview.postMessage({
      type: "device-selected",
      device,
    });
  }

  postSettingsChanged() {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "ext-settings-updated",
      apiKey: this.extSettings.apiKey,
      apiHost: this.extSettings.apiHost,
    });
  }

  postDeviceConnectivityStatus(status: string) {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "device-connectivity-status",
      status,
    });
  }

  onDidReceiveMessage(message: any) {
    Logger.getInstance().log(message);

    switch (message.type) {
      case "request-persisted-device":
        this.onRequestPersistedDevice();
        break;
      case "reset-persisted-device":
        this.onResetPersistedDevice();
        break;
      case "request-ext-settings":
        this.postSettingsChanged();
        break;
      case "request-device-connectivity-status":
        this.onRequestDeviceConnectivityStatus(message.deviceId);
        break;
      case "open-ext-settings":
        this.onOpenExtSettings();
        break;
      case "command":
        this.handleCommand(message);
        break;
      default:
        break;
    }
  }

  private onRequestPersistedDevice() {
    const device = this.state.getActiveDevice();
    this.postDeviceChanged(device);
  }

  private onResetPersistedDevice() {
    this.state.clearActiveDevice().then(() => {
      this.postDeviceChanged(undefined);
    });
  }

  private onRequestDeviceConnectivityStatus(deviceId: string) {
    new ApiClient()
      .getDeviceConnectivityStatus(deviceId)
      .then((res) => {
        return res.status || "unknown";
      })
      .catch((e) => {
        Logger.getInstance().log(e);
        return "unknown";
      })
      .then((status) => this.postDeviceConnectivityStatus(status));
  }

  private onOpenExtSettings() {
    vscode.commands.executeCommand("workbench.action.openSettings", "Enapter");
  }

  private handleCommand(message: any) {
    switch (message.command) {
      case CommandIDs.Devices.SelectActive:
        void this.onSelectActiveDevice(message);
        break;
      case CommandIDs.Blueprints.UploadToActiveDevice:
        void this.onUploadBlueprintToActiveDevice();
        break;
      default:
        break;
    }
  }

  private startCommand(command: CommandID) {
    this.view?.webview.postMessage({
      type: "command-started",
      command,
    });
  }

  private finishCommand(command: CommandID) {
    this.view?.webview.postMessage({
      type: "command-finished",
      command,
    });
  }

  private onSelectActiveDevice(message: any) {
    vscode.commands.executeCommand<Device | undefined>(CommandIDs.Devices.SelectActive).then((d) => {
      if (!d) {
        return;
      }

      this.state.setActiveDevice(d).then(() => {
        this.postDeviceChanged(d);
      });
    });
  }

  private onUploadBlueprintToActiveDevice() {
    this.startCommand(CommandIDs.Blueprints.UploadToActiveDevice);
    void vscode.commands.executeCommand<Device>(CommandIDs.Blueprints.UploadToActiveDevice).then(() => {
      this.finishCommand(CommandIDs.Blueprints.UploadToActiveDevice);
    });
  }

  resolveWebviewView(webviewView: WebviewView, _context: WebviewViewResolveContext, _token: CancellationToken) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
      enableCommandUris: true,
    };

    webviewView.webview.onDidReceiveMessage((message: any) => {
      this.onDidReceiveMessage(message);
    });

    const metaContent = [
      "default-src 'none'",
      `style-src ${webviewView.webview.cspSource}`,
      `font-src ${webviewView.webview.cspSource}`,
      `img-src ${webviewView.webview.cspSource} https:`,
      `script-src 'nonce-${this.nonce}'`,
    ].join("; ");

    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="${metaContent}">
          <link href="${this.styleUri}" rel="stylesheet">
          <title>App</title>
        </head>
      
        <body>
          <div id="app">
            Root div
          </div>
          
          <script nonce="${this.nonce}" src="${this.scriptUri}"></script>
        </body>
      </html>
      `;
  }

  private get scriptUri() {
    return this.view?.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "app.js"));
  }

  private get styleUri() {
    return this.view?.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "app.css"));
  }
}
