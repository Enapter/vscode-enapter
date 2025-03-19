import vscode from "vscode";
import { Manifest } from "../models/manifests/manifest";
import { uploadBlueprintToActiveDevice } from "./upload-blueprint-to-active-device";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import yaml from "js-yaml";

export async function uploadActiveEditorManifest() {
  const logger = Logger.getInstance();
  logger.group("Upload Active Editor Manifest");

  try {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("No active editor found");
      return;
    }

    const document = editor.document;

    if (!document || !document.fileName.endsWith("manifest.yml")) {
      vscode.window.showErrorMessage("Current file is not a manifest.yml");
      return;
    }

    const fileContent = document.getText();

    if (!fileContent) {
      vscode.window.showErrorMessage("Manifest file is empty");
      return;
    }

    try {
      const content = yaml.load(fileContent);

      if (!Manifest.isManifest(content)) {
        vscode.window.showErrorMessage("Current file is not a valid manifest");
        return;
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        "Failed to parse manifest: " + (error instanceof Error ? error.message : String(error)),
      );

      return;
    }

    const fileUri = document.uri;
    const manifest = new Manifest(fileUri);
    const state = ExtState.instance;
    void state.setRecentManifest(manifest);

    return uploadBlueprintToActiveDevice(manifest);
  } catch (error) {
    logger.log("Failed to upload manifest from active editor");
    logger.log(error);

    vscode.window.showErrorMessage(
      "Failed to upload manifest: " + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    logger.groupEnd();
  }
}
