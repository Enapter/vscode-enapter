import vscode, { CancellationError, ProgressLocation, QuickPickItem, QuickPickItemKind } from "vscode";
import { Manifest } from "../models/manifests/manifest";
import { BlueprintZipper } from "../blueprint-zipper";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { ExtContext } from "../ext-context";
import { ExtError } from "../ext-error";
import { PickManifestTask } from "../tasks/pick-manifest-task";

function getDetail(manifest: Manifest): string | undefined {
  return manifest.relativePath;
}

function getManifestsPicks(manifests: Manifest[], recentManifest: Manifest | undefined): Thenable<QuickPickItem[]> {
  const list: Promise<QuickPickItem>[] = [];

  const recentManifestInList = manifests.find((m) => m.uri.fsPath === recentManifest?.uri.fsPath);

  if (recentManifestInList) {
    list.push(
      new Promise((resolve) => {
        resolve({
          label: "Last used",
          kind: QuickPickItemKind.Separator,
        });
      }),
    );

    list.push(
      new Promise((resolve) => {
        resolve(
          recentManifestInList.load().then((m) => {
            return {
              label: m.displayName || m.filename,
              detail: getDetail(recentManifestInList),
            };
          }),
        );
      }),
    );
  }

  const filtered = manifests.filter((m) => {
    if (!recentManifestInList) {
      return true;
    }

    return m.uri.fsPath !== recentManifestInList.uri.fsPath;
  });

  if (filtered.length === 0) {
    return Promise.all(list);
  }

  if (recentManifestInList) {
    list.push(
      new Promise((resolve) => {
        resolve({
          label: "",
          kind: QuickPickItemKind.Separator,
        });
      }),
    );
  }

  filtered.forEach((m) => {
    list.push(
      new Promise((resolve) => {
        resolve(
          m.load().then((manifest) => {
            return {
              label: manifest.displayName || manifest.filename,
              detail: getDetail(m),
            };
          }),
        );
      }),
    );
  });

  return Promise.all(list);
}

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
      const state = new ExtState(ExtContext.context);

      void state.setRecentManifest(manifest);
      const zipper = new BlueprintZipper(await manifest.load());
      const client = new ApiClient();
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
