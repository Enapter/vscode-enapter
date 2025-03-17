import vscode from "vscode";

const CLOUD_HOST = "https://api.enapter.com";

export class ExtSettings {
  static instance: ExtSettings;
  
  private _onDidChangeSettings = new vscode.EventEmitter<void>();
  readonly onDidChangeSettings = this._onDidChangeSettings.event;
  
  private disposables: vscode.Disposable[] = [];

  constructor() {
    if (ExtSettings.instance) {
      return ExtSettings.instance;
    }
    
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("enapter")) {
          this._onDidChangeSettings.fire();
        }
      })
    );

    ExtSettings.instance = this;
  }
  
  dispose() {
    this.disposables.forEach(d => d.dispose());
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

  private get config() {
    return vscode.workspace.getConfiguration("enapter");
  }
}
