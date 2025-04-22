import vscode from "vscode";

const CLOUD_HOST = "https://api.enapter.com";

export class ExtSettings {
  static instance: ExtSettings;

  private _onDidChangeSettings = new vscode.EventEmitter<void>();
  readonly onDidChangeSettings = this._onDidChangeSettings.event;

  private _onDidChangeConnectionSettings = new vscode.EventEmitter<void>();
  readonly onDidChangeConnectionSettings = this._onDidChangeConnectionSettings.event;

  private disposables: vscode.Disposable[] = [];

  constructor() {
    if (ExtSettings.instance) {
      throw new Error("ExtSettings is already initialized");
    }

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("enapter")) {
          this._onDidChangeSettings.fire();
        }
      }),
    );

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (
          e.affectsConfiguration("enapter.apiHost") ||
          e.affectsConfiguration("enapter.connectionType") ||
          e.affectsConfiguration("enapter.apiKey")
        ) {
          this._onDidChangeConnectionSettings.fire();
        }
      }),
    );

    ExtSettings.instance = this;
  }

  static getInstance() {
    if (!ExtSettings.instance) {
      throw new Error("ExtSettings is not initialized");
    }

    return ExtSettings.instance;
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }

  setConnectionType(type: "cloud" | "gateway") {
    return this.config.update("connectionType", type);
  }

  get connectionType(): "cloud" | "gateway" {
    return this.config.get("connectionType") || "cloud";
  }

  get apiKey(): string {
    return this.config.get("apiKey") || "";
  }

  get apiHost(): string {
    if (this.connectionType === "cloud") {
      return CLOUD_HOST;
    }

    return this.config.get("apiHost") || "";
  }

  get cloudApiToken() {
    return this.config.get("enapter.cloudApiToken");
  }

  setCloudApiToken(token: string | undefined) {
    return this.config.update("cloudApiToken", token);
  }

  isCloudApiTokenSet() {
    return !!this.cloudApiToken;
  }

  private get config() {
    return vscode.workspace.getConfiguration("enapter");
  }
}
