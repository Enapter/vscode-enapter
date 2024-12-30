import vscode from "vscode";
import { Manifest } from "./manifest";
import JSZip from "jszip";
import { loggable, Logger } from "./logger";

export class BlueprintZipper {
  private manifest: Manifest;
  private zipper: JSZip;

  constructor(
    manifest: Manifest,
    private readonly logger = Logger.getInstance(),
  ) {
    this.manifest = manifest;
    this.zipper = new JSZip();
  }

  @loggable()
  async zip() {
    if (!this.manifest.content) {
      this.logger.log("No content found in manifest");
      return;
    }

    this.zipper.file(this.manifest.name, this.manifest.content);

    if (await this.isLuaDir()) {
      await this.zipLuaDir();
    } else {
      await this.zipLuaFile();
    }

    return this.zipper.generateAsync({ type: "uint8array" });
  }

  private async zipLuaDir() {
    const luaDirPath = this.getLuaFsPath();
    const folder = this.zipper.folder(this.manifest.luaPath!);
    await this.addFilesToZip(luaDirPath, folder!);
  }

  private async addFilesToZip(dirPath: string, zipFolder: JSZip) {
    const dirUri = vscode.Uri.file(dirPath);
    const files = await vscode.workspace.fs.readDirectory(dirUri);

    for (const [name, type] of files) {
      const filePath = `${dirPath}/${name}`;
      const fileUri = vscode.Uri.file(filePath);

      if (type === vscode.FileType.Directory) {
        const newFolder = zipFolder.folder(name);
        await this.addFilesToZip(filePath, newFolder!);
      } else if (type === vscode.FileType.File) {
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        zipFolder.file(name, fileContent);
      }
    }
  }

  private async zipLuaFile() {
    if (!this.manifest.luaPath) {
      this.logger.log("No lua path found in manifest");
      return;
    }

    const luaContent = await vscode.workspace.fs.readFile(vscode.Uri.file(this.getLuaFsPath()));
    this.zipper.file(this.manifest.luaPath, luaContent);
  }

  private getLuaFsPath() {
    const path = this.manifest.luaFsPath;
    this.logger.log("Lua path:", path);
    return this.manifest.luaFsPath;
  }

  private async isLuaDir() {
    return this.isDir(this.getLuaFsPath());
  }

  private async isDir(path: string) {
    const stat = await vscode.workspace.fs.stat(vscode.Uri.file(path));
    return stat.type === vscode.FileType.Directory;
  }
}
