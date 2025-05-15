import vscode from "vscode";
import { ContextKeys } from "./constants/context-keys";

export class ExtContext {
  private static instance: ExtContext;

  private isDeviceLogging: boolean = false;

  private _onDidChangeDeviceLoggingState = new vscode.EventEmitter<boolean>();
  readonly onDidChangeDeviceLoggingState = this._onDidChangeDeviceLoggingState.event;

  constructor(public readonly context: vscode.ExtensionContext) {
    ExtContext.instance = this;
  }

  static getInstance() {
    if (!ExtContext.instance) {
      throw new Error("ExtContext not initialized");
    }

    return ExtContext.instance;
  }

  static get context() {
    return ExtContext.getInstance().context;
  }

  setDeviceLoggingState(isLogging: boolean) {
    this.isDeviceLogging = isLogging;
    vscode.commands.executeCommand("setContext", ContextKeys.Devices.IsLogging, isLogging);
    this._onDidChangeDeviceLoggingState.fire(isLogging);
  }

  getIsDeviceLogging(): boolean {
    return this.isDeviceLogging;
  }
}
