import vscode from "vscode";
import { ManifestParser } from "./manifest-parser";
import { BlueprintSpec, ManifestV1Schema } from "./schemas";

export class ManifestV1Parser implements ManifestParser<ManifestV1Schema> {
  constructor(
    public uri: vscode.Uri,
    public contentJson: ManifestV1Schema,
  ) {}

  getDisplayName() {
    return this.contentJson.display_name;
  }

  getLuaPath(): string | undefined {
    if (!this.commModule) {
      return;
    }

    if (this.commModule.lua_file) {
      return this.commModule.lua_file;
    }

    const luaProperty = this.commModule?.lua;

    if (luaProperty?.file) {
      return luaProperty.file;
    }

    if (luaProperty?.dir) {
      return luaProperty.dir;
    }
  }

  getBlueprintSpec(): BlueprintSpec {
    return BlueprintSpec.V1;
  }

  private get commModule(): ManifestV1Schema["communication_module"] {
    return this.contentJson.communication_module;
  }
}
