import vscode, { CancellationError, ProgressLocation } from "vscode";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { PickManifestTask } from "../tasks/pick-manifest-task";
import { Device } from "../models/device";
import { BlueprintZipper } from "../blueprint-zipper";
import { ApiClient } from "../api/client";
import { ExtError } from "../ext-error";
import { SitesConnectionsService } from "../services/sites-connections-service";

export const getErrorDescription = (e: unknown) => {
  if (!e) {
    return;
  }

  try {
    if (typeof e === "object" && "errors" in e && Array.isArray(e.errors)) {
      return e.errors
        .map((err) => err.message)
        .filter((m) => !!m)
        .join(" ");
    }
  } catch (e) {
    console.error(e);
  }
};

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

export async function devicesUploadBlueprint(device: Device, sitesConnectionsService: SitesConnectionsService) {
  const tokenSource = new vscode.CancellationTokenSource();

  const manifest = await new PickManifestTask().run(tokenSource.token);

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
      const site = sitesConnectionsService.getById(device.site_id);

      if (!site) {
        logger.log("Failed to get site");
        vscode.window.showErrorMessage("Failed to get site");
        return;
      }

      const client = await ApiClient.forSite(site);

      if (!client) {
        logger.log("Failed to get API client");
        vscode.window.showErrorMessage("Failed to get API client");
        return;
      }

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
        const description = getErrorDescription(e);
        const message = description ? `Failed to upload blueprint: ${description}` : "Failed to upload blueprint";
        vscode.window.showErrorMessage(message);
      }
    } finally {
      logger.groupEnd();
    }
  });
}
