import vscode, { CancellationError, ProgressLocation } from "vscode";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { PickManifestTask } from "../tasks/pick-manifest-task";
import { Device } from "../models/device";
import { ExtContext } from "../ext-context";
import { BlueprintZipper } from "../blueprint-zipper";
import { ApiClient } from "../api/client";
import { ExtError } from "../ext-error";

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

export async function devicesUploadBlueprintToDevice(device: Device) {
  const tokenSource = new vscode.CancellationTokenSource();

  const manifest = await new PickManifestTask().run(tokenSource.token);

  if (!manifest) {
    return;
  }

  return withProgress(async (progress, token) => {
    const logger = Logger.getInstance();

    try {
      logger.group("Upload Blueprint");
      const state = new ExtState(ExtContext.context);

      void state.setRecentManifest(manifest);
      const zipper = new BlueprintZipper(await manifest.load());
      const client = new ApiClient();

      progress.report({ message: "Adding files to an archive" });
      const zip = await zipper.zip();

      if (!zip) {
        logger.log("Failed to zip the blueprint");
        vscode.window.showErrorMessage("Failed to zip the blueprint");
        return;
      }

      progress.report({ message: "Uploading" });
      const {
        blueprint: { id: blueprintId },
      } = await client.uploadBlueprint(zip);

      vscode.window.showInformationMessage(`Blueprint uploaded successfully. Blueprint ID: ${blueprintId}`);
      progress.report({ message: "Assigning blueprint to the active device" });
      await client.assignBlueprintToDevice(blueprintId, device.id, token);
      vscode.window.showInformationMessage(`Blueprint assigned to device ${device.name}`);
      void state.addRecentDevice(device);

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
