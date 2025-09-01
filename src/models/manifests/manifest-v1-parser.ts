import { ManifestParser } from "./manifest-parser";
import { BlueprintSpec, ManifestV1Schema } from "./schemas";
import { CommModule } from "./schemas/v1";

export class ManifestV1Parser implements ManifestParser<ManifestV1Schema> {
  constructor(readonly contentJson: ManifestV1Schema) {}

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

  getRockspecFilename(): string | undefined {
    return this.commModule?.lua?.rockspec;
  }

  private get commModule(): ManifestV1Schema["communication_module"] {
    return this.contentJson.communication_module || this.commModuleFromModulesSection;
  }

  private get commModuleFromModulesSection(): CommModule | undefined {
    if (!this.contentJson.communication_modules) {
      return;
    }

    const keys = Object.keys(this.contentJson.communication_modules);
    return this.contentJson.communication_modules[keys[0]] as CommModule;
  }
}
