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
    message: string | undefined = "Error loading manifest.",
    private uri?: vscode.Uri,
  ) {
    let msg = message;
    if (uri) {
      msg += ` ${uri.path}`;
    }
    super(msg);
  }

  static isManifestError(e: unknown): e is IManifestError {
    return e instanceof ManifestError;
  }

  showErrorMessage() {
    if (this.uri) {
      vscode.window.showErrorMessage(this.message, new OpenManifestMessageItem(this.uri)).then((item) => {
        if (!item) {
          return;
        }

        item.openManifest();
      });
    } else {
      vscode.window.showErrorMessage(this.message);
    }
  }
}

export class InvalidBlueprintManifestError extends ManifestError {
  constructor(message: string = "Invalid blueprint manifest.", uri?: vscode.Uri) {
    super(message, uri);
  }
}

export class InvalidBlueprintSpecError extends ManifestError {
  constructor(message: string = "Invalid blueprint spec.", uri?: vscode.Uri) {
    super(message, uri);
  }
}

export class ManifestNotLoadedError extends ManifestError {
  constructor(message: string = "Manifest not loaded.", uri?: vscode.Uri) {
    super(message, uri);
  }
}

export class InvalidManifestLuaPathError extends ManifestError {
  constructor(message: string = "Invalid lua path.", uri?: vscode.Uri) {
    super(message, uri);
  }
}
