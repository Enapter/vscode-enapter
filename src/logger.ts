import vscode from "vscode";

export interface ILogger {
  log(...messages: any[]): void;
  error(...messages: any[]): void;
  group(tag: string): void;
  groupEnd(): void;
}

export class Logger {
  private static instance: Logger;
  private loggers: Set<ILogger> = new Set();
  private channel: vscode.OutputChannel;
  private groups: string[] = [];

  constructor() {
    this.channel = vscode.window.createOutputChannel("Enapter");

    if (!Logger.instance) {
      Logger.instance = this;
    }

    return Logger.instance;
  }

  static getInstance() {
    if (!Logger.instance) {
      throw new Error("Logger is not initialized");
    }

    return Logger.instance;
  }

  static log(...messages: any[]) {
    Logger.getInstance().log(...messages);
  }

  static error(...messages: any[]) {
    Logger.getInstance().error(...messages);
  }

  log(...messages: any[]) {
    const message = this.prependWithAdditionalInfo(messages.map(this.stringify).join(" "));
    this.channel.appendLine(message);
    this.loggers.forEach((ch) => ch.log(message));
  }

  error(...messages: any[]) {
    const message = this.prependWithAdditionalInfo(messages.map(this.stringify).join(" "));
    this.channel.appendLine(message);
    this.loggers.forEach((ch) => ch.error(message));
  }

  group(tag: string) {
    this.groups.push(tag);
  }

  groupEnd() {
    this.groups.pop();
  }

  addLogger(l: ILogger) {
    this.loggers.add(l);
  }

  removeLogger(l: ILogger) {
    this.loggers.delete(l);
  }

  private get nowUTC() {
    return new Date().toISOString();
  }

  private get formattedTags() {
    return this.groups.map((tag) => `[${tag}]`).join(" ");
  }

  private stringify(obj: any) {
    if (obj?.constructor?.name === "Error" || obj instanceof Error) {
      return [obj.message, obj.stack].join("\n");
    }

    if (obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
      return `<binary> (${obj.byteLength} bytes)`;
    }

    switch (typeof obj) {
      case "string":
        return obj;
      case "object":
        return JSON.stringify(obj);
      default:
        return String(obj);
    }
  }

  private prependWithAdditionalInfo(message: string) {
    return `[${this.nowUTC}] ${this.formattedTags} ${message}`;
  }
}

export function loggable() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const logger = ((this as any).logger as ILogger) || undefined;

      if (!logger) {
        return originalMethod.apply(this, args);
      }

      logger.group(propertyKey);
      const result = originalMethod.apply(this, args);
      logger.groupEnd();
      return result;
    };

    return descriptor;
  };
}
