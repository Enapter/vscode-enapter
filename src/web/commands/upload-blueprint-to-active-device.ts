import vscode from "vscode";
import { ProjectExplorer } from "../project-explorer";
import { Manifest } from "../manifest";
import { BlueprintZipper } from "../blueprint-zipper";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { ExtContext } from "../ext-context";

function getManifestsPicks(manifests: Manifest[]) {
  return manifests.map((m) => {
    return {
      label: m.name,
      detail: m.relativePath,
    };
  });
}

export async function uploadBlueprintToActiveDevice() {
  const logger = Logger.getInstance();
  logger.group("Upload Blueprint");

  try {
    const pe = new ProjectExplorer();

    const manifests = await pe.findAllManifests().then((manifests) => {
      return manifests.map((m) => {
        return new Manifest(m);
      });
    });

    if (manifests.length === 0) {
      logger.log("No manifest.yml found");
      vscode.window.showErrorMessage("No manifest.yml found");
      return;
    }

    let manifest = manifests[0];

    if (manifests.length > 1) {
      const selectedManifest = await vscode.window.showQuickPick(getManifestsPicks(manifests), {
        placeHolder: "Choose a manifest.yml file",
      });

      if (!selectedManifest) {
        return;
      }

      manifest = manifests.find((m) => m.relativePath === selectedManifest.detail) || manifest;
    }

    await manifest.loadContent();
    const zipper = new BlueprintZipper(manifest);
    const client = new ApiClient();
    const state = new ExtState(ExtContext.context);
    const device = state.getActiveDevice();

    if (!device) {
      vscode.window.showErrorMessage("No active device found");
      return;
    }

    const zip = await zipper.zip();

    if (!zip) {
      logger.log("Failed to zip the blueprint");
      vscode.window.showErrorMessage("Failed to zip the blueprint");
      return;
    }

    const {
      blueprint: { id: blueprintId },
    } = await client.uploadBlueprint(zip);

    vscode.window.showInformationMessage(`Blueprint uploaded successfully. Blueprint ID: ${blueprintId}`);
    await client.assignBlueprintToDevice(blueprintId, device.id);
    vscode.window.showInformationMessage(`Blueprint assigned to device ${device.name}`);
    void state.addRecentDevice(device);

    return device;
  } catch (e) {
    logger.log(e);
    vscode.window.showErrorMessage("Failed to upload blueprint");
  } finally {
    logger.groupEnd();
  }
}
