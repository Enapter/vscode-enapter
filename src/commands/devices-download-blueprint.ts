import { Device } from "../models/device";
import { SitesConnectionsService } from "../services/sites-connections-service";
import { ApiClient } from "../api/client";
import vscode from "vscode";
import JSZip from "jszip";
import { Logger } from "../logger";

export const devicesDownloadBlueprint = async (device: Device, sitesConnectionsServices: SitesConnectionsService) => {
  const activeSite = sitesConnectionsServices.getActive();

  if (!activeSite) {
    return;
  }

  const blueprintId = device.blueprint_id;

  const apiClient = await ApiClient.forSite(activeSite);

  const shouldUnzipResponse = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Do you want to unzip the blueprint file?",
  });

  const shouldUnzip = shouldUnzipResponse === "Yes";

  const path = await vscode.window.showInputBox({
    prompt: `Enter the path to save the blueprint${shouldUnzip ? "" : " zip file"}`,
    value: shouldUnzip ? `${device.slug}.blueprint` : `${device.slug}.blueprint.zip`,
  });

  const blob = await apiClient.downloadBlueprintAsZipByDeviceId(blueprintId);

  if (shouldUnzip) {
    const zip = await new JSZip().loadAsync(await blob.arrayBuffer());

    for (const filename of Object.keys(zip.files)) {
      const file = zip.files[filename];

      if (!file.dir) {
        const content = await file.async("uint8array");
        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(`${vscode.workspace.rootPath}/${path}/${filename}`),
          content,
        );
      } else {
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(`${vscode.workspace.rootPath}/${path}/${filename}`));
      }
    }
  } else {
    await vscode.workspace.fs.writeFile(vscode.Uri.file(`${vscode.workspace.rootPath}/${path}`), await blob.bytes());
  }

  return blob;
};
