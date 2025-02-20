import vscode from "vscode";

interface IManifestError {
  showErrorMessage(): void;
}

export class ManifestError extends Error implements IManifestError {
  constructor(uri: vscode.Uri, message: string = "Error loading manifest.") {
    super(`${message} ${uri.path}`);
  }

  static isManifestError(e: unknown): e is IManifestError {
    return e instanceof ManifestError;
  }

  showErrorMessage() {
    vscode.window.showErrorMessage(this.message);
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
