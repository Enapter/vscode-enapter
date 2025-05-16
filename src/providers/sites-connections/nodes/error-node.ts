import vscode from "vscode";

export class ErrorNode extends vscode.TreeItem {
  constructor(private readonly error: string) {
    super(error);
  }
}
