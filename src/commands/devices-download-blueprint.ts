import { Device } from "../models/device";
import { SitesConnectionsService } from "../services/sites-connections-service";
import { ApiClient } from "../api/client";
import vscode from "vscode";
import JSZip from "jszip";

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

  const wsUri = vscode.workspace.workspaceFolders?.[0].uri;

  const fileUri = wsUri
    ? shouldUnzip
      ? vscode.Uri.joinPath(wsUri, `${device.slug}-blueprint`)
      : vscode.Uri.joinPath(wsUri, `${device.slug}-blueprint.zip`)
    : shouldUnzip
      ? vscode.Uri.file(`${device.slug}-blueprint`)
      : vscode.Uri.file(`${device.slug}-blueprint.zip`);

  const path = await vscode.window.showInputBox({
    prompt: `Enter the path to save the blueprint${shouldUnzip ? "" : " zip file"}`,
    value: fileUri.fsPath,
  });

  if (!path?.trim()) {
    return;
  }

  const blob = await apiClient.downloadBlueprintAsZipByDeviceId(blueprintId);

  if (shouldUnzip) {
    const zip = await new JSZip().loadAsync(await blob.arrayBuffer());

    for (const filename of Object.keys(zip.files)) {
      const file = zip.files[filename];
      const writeUri = vscode.Uri.joinPath(vscode.Uri.file(path), filename);

      if (!file.dir) {
        const content = await file.async("uint8array");
        await vscode.workspace.fs.writeFile(writeUri, content);
      } else {
        await vscode.workspace.fs.createDirectory(writeUri);
      }
    }
  } else {
    await vscode.workspace.fs.writeFile(vscode.Uri.file(path), await blob.bytes());
  }

  return blob;
};
