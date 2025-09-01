import { ManifestParser } from "./manifest-parser";
import { BlueprintSpec, ManifestV3Schema } from "./schemas";
import { InvalidBlueprintManifestError } from "./manifest-errors";

export class ManifestV3Parser implements ManifestParser<ManifestV3Schema> {
  constructor(readonly contentJson: ManifestV3Schema) {}

  getDisplayName() {
    return this.contentJson.display_name;
  }

  getLuaPath(): string | undefined {
    if (this.options?.file) {
      return this.options.file;
    }

    if (this.options?.dir) {
      return this.options.dir;
    }
  }

  getBlueprintSpec(): BlueprintSpec {
    return BlueprintSpec.V3;
  }

  getRockspecFilename(): string | undefined {
    return this.options?.rockspec;
  }

  private get options(): ManifestV3Schema["runtime"]["options"] {
    const options = this.contentJson.runtime.options;

    if (!options) {
      throw new InvalidBlueprintManifestError("Missing 'runtime.options' in manifest");
    }

    return options;
  }
}
