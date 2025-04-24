import vscode, { CancellationError, ProgressLocation } from "vscode";
import { Manifest } from "../models/manifests/manifest";
import { BlueprintZipper } from "../blueprint-zipper";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { ExtError } from "../ext-error";
import { PickManifestTask } from "../tasks/pick-manifest-task";

const withProgress = (cb: Parameters<typeof vscode.window.withProgress>[1]) => {
  return vscode.window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Uploading Blueprint",
      cancellable: true,
    },
    cb,
  );
};

export async function uploadBlueprintToActiveDevice(providedManifest?: Manifest) {
  const tokenSource = new vscode.CancellationTokenSource();

  let manifest = providedManifest;
  if (!manifest) {
    manifest = await new PickManifestTask().run(tokenSource.token);
  }

  if (!manifest) {
    return;
  }

  return withProgress(async (progress, token) => {
    const logger = Logger.getInstance();

    try {
      logger.group("Upload Blueprint");
      const state = ExtState.getInstance();

      void state.setRecentManifest(manifest);
      const zipper = new BlueprintZipper(await manifest.load());
      const device = state.getActiveDevice();

      if (!device) {
        vscode.window.showErrorMessage("No active device found");
        return;
      }

      progress.report({ message: "Adding files to an archive" });
      const zip = await zipper.zip();

      if (!zip) {
        logger.log("Failed to zip the blueprint");
        vscode.window.showErrorMessage("Failed to zip the blueprint");
        return;
      }

      const client = await ApiClient.forSite(device?.site);
      progress.report({ message: "Uploading" });

      if (!client) {
        logger.log("Failed to get API client");
        vscode.window.showErrorMessage("Failed to get API client");
        return;
      }

      const {
        blueprint: { id: blueprintId },
      } = await client.uploadBlueprint(zip);

      vscode.window.showInformationMessage(`Blueprint uploaded successfully. Blueprint ID: ${blueprintId}`);
      progress.report({ message: "Assigning blueprint to the active device" });
      await client.assignBlueprintToDevice(blueprintId, device.id, token);
      vscode.window.showInformationMessage(`Blueprint assigned to device ${device.name}`);

      return device;
    } catch (e) {
      if (e instanceof CancellationError) {
        return;
      }

      logger.log("Failed to upload blueprint");
      logger.log(e);

      if (e instanceof ExtError) {
        vscode.window.showErrorMessage(e.message);
      } else {
        vscode.window.showErrorMessage("Failed to upload blueprint");
      }
    } finally {
      logger.groupEnd();
    }
  });
}
