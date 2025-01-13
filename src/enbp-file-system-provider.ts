import vscode from "vscode";
import JSZip from "jszip";
import { loggable, Logger } from "./logger";

class File implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  name: string;
  data?: Uint8Array;

  constructor(name: string) {
    this.type = vscode.FileType.File;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
}

class Directory implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  name: string;
  entries: Map<string, File | Directory>;

  constructor(name: string) {
    this.type = vscode.FileType.Directory;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    this.entries = new Map();
  }
}

export class EnbpFileSystemProvider implements vscode.FileSystemProvider {
  private emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this.emitter.event;

  public watch(_uri: vscode.Uri, _options: { recursive: boolean; excludes: string[] }): vscode.Disposable {
    return new (class {
      dispose() {}
    })();
  }

  @loggable()
  public async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    this.ignoreIfVscodeRelated(uri);

    const enbpUri = vscode.Uri.parse(uri.query);
    const archive = await this.toArchive(enbpUri);
    const path = this.removeLeadingSlash(uri);

    if (!path) {
      Logger.log("no path", uri, path);
      return new Directory("");
    }

    const entry = this.getArchiveEntry(archive, path);

    if (!entry) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    return entry.dir ? new Directory(entry.name) : new File(entry.name);
  }

  @loggable()
  public async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    this.ignoreIfVscodeRelated(uri);

    const enbpUri = vscode.Uri.parse(uri.query);
    const archive = await this.toArchive(enbpUri);
    const entries: [string, vscode.FileType][] = [];
    const treePath = this.addTrailingSlash(uri);

    archive.forEach((path, entry) => {
      if (!entry) {
        return;
      }

      path = this.toVSCodePath(path);

      if (!this.isSubtree(path, treePath)) {
        return;
      }

      path = path.slice(treePath.length, entry.dir ? -"/".length : undefined);

      if (!path || path.includes("/")) {
        return;
      }

      entries.push([path, entry.dir ? vscode.FileType.Directory : vscode.FileType.File]);
    });

    return entries;
  }

  @loggable()
  public async createDirectory(uri: vscode.Uri): Promise<void> {
    const enbpUri = vscode.Uri.parse(uri.query);
    const archive = await this.toArchive(enbpUri);
    const relativePath = this.removeLeadingSlash(uri);
    archive.folder(relativePath);
    const enbpPath = uri.query;
    const newZip = await archive.generateAsync({ type: "uint8array" });
    await vscode.workspace.fs.writeFile(vscode.Uri.parse(enbpPath), newZip);
  }

  @loggable()
  public async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    this.ignoreIfVscodeRelated(uri);

    const archiveUri = vscode.Uri.parse(uri.query);
    const zip = await this.toArchive(archiveUri);
    const entry = zip.file(uri.path.slice("/".length));

    if (!entry) {
      throw vscode.FileSystemError.FileNotFound();
    }

    return entry.async("uint8array");
  }

  @loggable()
  public async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    _options: { create: boolean; overwrite: boolean },
  ): Promise<void> {
    const enbpUri = vscode.Uri.parse(uri.query);
    const archive = await this.toArchive(enbpUri);
    const relativePath = this.removeLeadingSlash(uri);
    archive.file(relativePath, content);
    const enbpPath = uri.query;
    const newZip = await archive.generateAsync({ type: "uint8array" });
    await vscode.workspace.fs.writeFile(vscode.Uri.parse(enbpPath), newZip);
  }

  @loggable()
  public async delete(uri: vscode.Uri, _options: { recursive: boolean }): Promise<void> {
    const enbpUri = vscode.Uri.parse(uri.query);
    const archive = await this.toArchive(enbpUri);
    const relativePath = this.removeLeadingSlash(uri);
    archive.remove(relativePath);
    const enbpPath = uri.query;
    const newZip = await archive.generateAsync({ type: "uint8array" });
    await vscode.workspace.fs.writeFile(vscode.Uri.parse(enbpPath), newZip);
  }

  @loggable()
  public rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { overwrite: boolean }): void | Thenable<void> {}

  @loggable()
  private async toArchive(uri: vscode.Uri) {
    const zip = new JSZip();
    return await zip.loadAsync(await vscode.workspace.fs.readFile(uri), { createFolders: true });
  }

  get logger() {
    return Logger.getInstance();
  }

  private removeLeadingSlash(uri: vscode.Uri): string {
    if (uri.path.startsWith("/")) {
      return uri.path.slice(1);
    }

    return uri.path;
  }

  private addTrailingSlash(uri: vscode.Uri): string {
    return uri.path === "/" ? uri.path : uri.path + "/";
  }

  private toVSCodePath(path: string): string {
    return path.startsWith("/") ? path : "/" + path;
  }

  private getArchiveEntry(archive: JSZip, path: string) {
    return archive.files[path + "/"] || archive.files[path];
  }

  private isSubtree(path: string, subtree: string) {
    return path.startsWith(subtree);
  }

  private ignoreIfVscodeRelated(uri: vscode.Uri) {
    if (uri.path.startsWith("/.vscode") || uri.path.includes("devcontainer")) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
  }
}
