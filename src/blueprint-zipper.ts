import vscode from "vscode";
import { LoadedManifest } from "./models/manifests/manifest";
import JSZip from "jszip";

export class BlueprintZipper {
  private manifest: LoadedManifest;
  private readonly zipper: JSZip;
  private readonly permittedFilesGlob = "**/*.{lua,rockspec}";

  constructor(manifest: LoadedManifest) {
    this.manifest = manifest;
    this.zipper = new JSZip();
  }

  async zip() {
    const parentDirUri = vscode.Uri.joinPath(this.manifest.uri, "..");
    const globStr = `${vscode.workspace.asRelativePath(parentDirUri)}/${this.permittedFilesGlob}`;
    const uris = await vscode.workspace.findFiles(globStr);

    for (const uri of uris) {
      const content = await vscode.workspace.fs.readFile(uri);
      const relativePath = uri.path.replace(parentDirUri.path + "/", "");
      this.zipper.file(relativePath, content, { createFolders: false });
    }

    const manifestContent = await vscode.workspace.fs.readFile(this.manifest.uri);
    this.zipper.file("manifest.yml", manifestContent);

    return this.zipper.generateAsync({ type: "uint8array" });
  }
}
