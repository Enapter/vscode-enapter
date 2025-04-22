import vscode from "vscode";

export class ExtContext {
  private static instance: ExtContext;

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
}
