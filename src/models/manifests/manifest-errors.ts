import vscode from "vscode";
import { getFilename } from "../../utils/get-filename";

interface IManifestError {
  showErrorMessage(): void;
}

class OpenManifestMessageItem implements vscode.MessageItem {
  constructor(private uri: vscode.Uri) {}

  get title() {
    return `Open ${getFilename(this.uri)}`;
  }

  openManifest() {
    vscode.window.showTextDocument(this.uri);
  }
}

export class ManifestError extends Error implements IManifestError {
  constructor(
    private uri: vscode.Uri,
    message: string = "Error loading manifest.",
  ) {
    super(`${message} ${uri.path}`);
  }

  static isManifestError(e: unknown): e is IManifestError {
    return e instanceof ManifestError;
  }

  showErrorMessage() {
    vscode.window.showErrorMessage(this.message, new OpenManifestMessageItem(this.uri)).then((item) => {
      if (!item) {
        return;
      }

      item.openManifest();
    });
  }
}

export class InvalidBlueprintManifestError extends ManifestError {
  constructor(uri: vscode.Uri, message: string = "Invalid blueprint manifest.") {
    super(uri, message);
  }
}

export class InvalidBlueprintSpecError extends ManifestError {
  constructor(uri: vscode.Uri, message: string = "Invalid blueprint spec.") {
    super(uri, message);
  }
}

export class ManifestNotLoadedError extends ManifestError {
  constructor(uri: vscode.Uri, message: string = "Manifest not loaded.") {
    super(uri, message);
  }
}

export class InvalidManifestLuaPathError extends ManifestError {
  constructor(uri: vscode.Uri, message: string = "Invalid lua path.") {
    super(uri, message);
  }
}
