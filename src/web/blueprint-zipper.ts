import vscode from "vscode";
import {Manifest} from "./manifest";
import JSZip from "jszip";
import {loggable, Logger} from "./logger";

export class BlueprintZipper {
  private manifest: Manifest;
  private zipper: JSZip;

  constructor(
    manifest: Manifest,
    private readonly logger = Logger.getInstance()
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
      this.zipLuaDir();
    } else {
      await this.zipLuaFile();
    }

    return this.zipper.generateAsync({type: "uint8array"});
  }

  @loggable()
  private zipLuaDir() {
    this.zipper.folder(this.getLuaFsPath());
  }

  @loggable()
  private async zipLuaFile() {
    if (!this.manifest.luaPath) {
      this.logger.log("No lua path found in manifest");
      return;
    }

    const luaContent = await vscode.workspace.fs.readFile(vscode.Uri.file(this.getLuaFsPath()));
    this.zipper.file(this.manifest.luaPath, luaContent);
  }

  private getLuaFsPath() {
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
