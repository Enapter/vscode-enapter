import vscode from "vscode";
import { BlueprintSpec, ManifestSchema, ManifestV1Schema, ManifestV3Schema } from "./schemas";
import { ManifestParser } from "./manifest-parser";
import { ManifestV1Parser } from "./manifest-v1-parser";
import { ManifestV3Parser } from "./manifest-v3-parser";
import {
  InvalidBlueprintManifestError,
  InvalidBlueprintSpecError,
  InvalidManifestLuaPathError,
  ManifestNotLoadedError,
} from "./manifest-errors";
import yaml from "js-yaml";

export type SerializedManifest = {
  uri: string;
};

export interface IManifest {
  serialize(): SerializedManifest;
  load(): Promise<LoadedManifest>;
  uri: vscode.Uri;
  filename: string;
  relativePath: string;
  luaUri: vscode.Uri;
  luaFsPath: string;

  blueprintSpec?: BlueprintSpec;
  contentStr?: string;
  contentJson?: ManifestSchema;
  displayName?: string;
  luaPath?: string;
  rockspec?: string;
  rockspecPath?: string;
}

export interface LoadedManifest extends IManifest {
  blueprintSpec: BlueprintSpec;
  contentStr: string;
  contentJson: ManifestSchema;
  displayName: string;
  luaPath: string;
}

export class Manifest implements IManifest {
  public contentStr?: string;
  public contentJson?: ManifestSchema;

  private _parser: ManifestParser | undefined;

  constructor(public uri: vscode.Uri) {}

  static isManifest(json: unknown): json is ManifestSchema {
    if (!json || typeof json !== "object") {
      return false;
    }

    if (!("blueprint_spec" in json)) {
      return false;
    }

    return json.blueprint_spec === BlueprintSpec.V1 || json.blueprint_spec === BlueprintSpec.V3;
  }

  static isV1(json: unknown): json is ManifestV1Schema {
    return Manifest.isManifest(json) && json.blueprint_spec === BlueprintSpec.V1;
  }

  static isV3(json: unknown): json is ManifestV3Schema {
    return Manifest.isManifest(json) && json.blueprint_spec === BlueprintSpec.V3;
  }

  static deserialize(serialized: SerializedManifest) {
    return new Manifest(vscode.Uri.parse(serialized.uri));
  }

  serialize(): SerializedManifest {
    return { uri: this.uri.toString() };
  }

  async load(): Promise<LoadedManifest> {
    const decoder = new TextDecoder();
    const buffer = await vscode.workspace.fs.readFile(this.uri);
    this.contentStr = decoder.decode(buffer);
    const yml = yaml.load(this.contentStr);
    this.contentJson = this.getContentJson(yml);
    this.parser = this.getParserForContent(this.contentJson);

    return this as LoadedManifest;
  }

  get rockspec() {
    return this.parser.getRockspecFilename();
  }

  get rockspecPath() {
    if (!this.rockspec) {
      return undefined;
    }

    const fsDir = this.uri.fsPath.slice(0, this.uri.fsPath.lastIndexOf("/"));
    return `${fsDir}/${this.rockspec}`;
  }

  get filename() {
    return this.uri.fsPath.slice(this.uri.fsPath.lastIndexOf("/") + 1);
  }

  get relativePath() {
    return vscode.workspace.asRelativePath(this.uri);
  }

  get luaUri(): vscode.Uri {
    return vscode.Uri.joinPath(this.uri, this.luaPath);
  }

  get luaFsPath() {
    const fsDir = this.uri.fsPath.slice(0, this.uri.fsPath.lastIndexOf("/"));
    return `${fsDir}/${this.luaPath}`;
  }

  get luaPath(): string {
    const path = this.parser.getLuaPath();

    if (!path) {
      throw new InvalidManifestLuaPathError(this.uri);
    }

    return path;
  }

  get displayName(): ManifestSchema["display_name"] {
    return this.parser.getDisplayName();
  }

  get blueprintSpec(): BlueprintSpec {
    return this.parser.getBlueprintSpec();
  }

  private get parser(): ManifestParser {
    if (!this._parser) {
      throw new ManifestNotLoadedError(this.uri);
    }

    return this._parser;
  }

  private set parser(p: ManifestParser) {
    this._parser = p;
  }

  private getParserForContent(json: ManifestSchema): ManifestParser {
    switch (true) {
      case Manifest.isV1(json):
        return new ManifestV1Parser(this.uri, json);
      case Manifest.isV3(json):
        return new ManifestV3Parser(this.uri, json);
      default:
        throw new InvalidBlueprintSpecError(this.uri);
    }
  }

  private getContentJson(json: unknown): ManifestSchema {
    if (!Manifest.isManifest(json)) {
      throw new InvalidBlueprintManifestError(this.uri);
    }

    return json;
  }
}
