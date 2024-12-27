import vscode from "vscode";
import yaml from "js-yaml";

type Content = string | undefined;
type LuaPath = string | undefined;

type LuaPathLike = {
  communication_module?: {
    lua_file?: string;
  };
};

type DisplayNameLike = {
  display_name?: string;
};

type DescriptionLike = {
  description?: string;
};

class LuaFilePathNotFoundError extends Error {
  constructor() {
    super("Lua file path not found in the manifest.");
  }
}

export type SerializedManifest = {
  path: string;
};

export class Manifest {
  path: vscode.Uri;
  private _content: Content;

  constructor(path: vscode.Uri) {
    this.path = path;
  }

  static deserialize(serialized: SerializedManifest) {
    return new Manifest(vscode.Uri.parse(serialized.path));
  }

  serialize(): SerializedManifest {
    return {
      path: this.path.toString(),
    };
  }

  get name() {
    return this.path.fsPath.slice(this.path.fsPath.lastIndexOf("/") + 1);
  }

  get relativePath() {
    return vscode.workspace.asRelativePath(this.path);
  }

  get luaPath(): LuaPath {
    if (!this.content) {
      return undefined;
    }

    const parsed = yaml.load(this.content) as LuaPathLike;
    const path = parsed.communication_module?.lua_file;

    if (!path) {
      throw new LuaFilePathNotFoundError();
    }

    return path;
  }

  get fsPath() {
    return this.path.fsPath;
  }

  private get fsDir() {
    return this.fsPath.slice(0, this.fsPath.lastIndexOf("/"));
  }

  get luaFsPath() {
    return `${this.fsDir}/${this.luaPath}`;
  }

  private set content(content: Content) {
    this._content = content;
  }

  get content() {
    return this._content;
  }

  get displayName(): string | undefined {
    if (!this.content) {
      return undefined;
    }

    const parsed = yaml.load(this.content) as DisplayNameLike;
    return parsed.display_name;
  }

  get description(): string | undefined {
    if (!this.content) {
      return undefined;
    }

    const parsed = yaml.load(this.content) as DescriptionLike;
    return parsed.description;
  }

  async loadContent() {
    if (this._content) {
      return this;
    }

    const decoder = new TextDecoder();
    const buffer = await this.toBuffer();
    this.content = decoder.decode(buffer);

    return this;
  }

  private toBuffer() {
    return vscode.workspace.fs.readFile(this.path);
  }
}
