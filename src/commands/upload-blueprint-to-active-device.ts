import vscode, { QuickPickItem, QuickPickItemKind } from "vscode";
import { ProjectExplorer } from "../project-explorer";
import { Manifest } from "../manifest";
import { BlueprintZipper } from "../blueprint-zipper";
import { ApiClient } from "../api/client";
import { Logger } from "../logger";
import { ExtState } from "../ext-state";
import { ExtContext } from "../ext-context";
import { ExtError } from "../ext-error";

function getDetail(manifest: Manifest): string | undefined {
  return manifest.relativePath;
}

function getManifestsPicks(manifests: Manifest[], recentManifest: Manifest | undefined): Thenable<QuickPickItem[]> {
  const list: Promise<QuickPickItem>[] = [];

  const recentManifestInList = manifests.find((m) => m.fsPath === recentManifest?.fsPath);

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
          recentManifestInList.loadContent().then((m) => {
            return {
              label: m.displayName || m.name,
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

    return m.fsPath !== recentManifestInList.fsPath;
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
          m.loadContent().then((manifest) => {
            return {
              label: manifest.displayName || manifest.name,
              detail: getDetail(m),
            };
          }),
        );
      }),
    );
  });

  return Promise.all(list);
}

export async function uploadBlueprintToActiveDevice() {
  const logger = Logger.getInstance();
  logger.group("Upload Blueprint");
  const state = new ExtState(ExtContext.context);

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
      const recentManifest = state.getRecentManifest();
      const selectedManifest = await vscode.window.showQuickPick(getManifestsPicks(manifests, recentManifest), {
        placeHolder: "Choose a manifest.yml file",
        matchOnDetail: true,
      });

      if (!selectedManifest) {
        return;
      }

      manifest = manifests.find((m) => m.relativePath === selectedManifest.detail) || manifest;
    }

    void state.setRecentManifest(manifest);
    await manifest.loadContent();
    const zipper = new BlueprintZipper(manifest);
    const client = new ApiClient();
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

    if (e instanceof ExtError) {
      vscode.window.showErrorMessage(e.message);
      return;
    }
    
    vscode.window.showErrorMessage("Failed to upload blueprint");
  } finally {
    logger.groupEnd();
  }
}
