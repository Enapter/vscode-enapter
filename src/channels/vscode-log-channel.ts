import vscode from "vscode";
import { LogEntry } from "../models/log-entries";

export interface LogChannel<TLog> extends vscode.Disposable {
  log: (entry: TLog) => void;
  info: (message: string) => void;
  error: (message: string) => void;
  revealPanel: () => void;
  onDidChangeLogLevel: vscode.Event<vscode.LogLevel>;
}

export class VscodeLogChannel<TLog extends LogEntry> implements LogChannel<TLog> {
  private channel: vscode.LogOutputChannel;

  private _onDidChangeLogLevel: vscode.EventEmitter<vscode.LogLevel> = new vscode.EventEmitter<vscode.LogLevel>();
  readonly onDidChangeLogLevel: vscode.Event<vscode.LogLevel> = this._onDidChangeLogLevel.event;

  constructor() {
    this.channel = vscode.window.createOutputChannel("Enapter: Device logs", { log: true });
    this.channel.onDidChangeLogLevel((level) => this._onDidChangeLogLevel.fire(level));
  }

  log(entry: TLog): void {
    switch (entry.level) {
      case vscode.LogLevel.Debug:
        this.channel.debug(entry.message);
        break;
      case vscode.LogLevel.Info:
        this.channel.info(entry.message);
        break;
      case vscode.LogLevel.Warning:
        this.channel.warn(entry.message);
        break;
      case vscode.LogLevel.Error:
        this.channel.error(entry.message);
        break;
      default:
        this.channel.appendLine(entry.message);
    }
  }

  info(message: string): void {
    this.channel.info(message);
  }

  error(message: string): void {
    this.channel.error(message);
  }

  revealPanel() {
    this.channel.show();
  }

  dispose(): void {
    this.channel.dispose();
  }
}
