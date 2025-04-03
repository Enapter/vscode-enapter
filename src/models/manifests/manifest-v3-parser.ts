import vscode from "vscode";
import { ManifestParser } from "./manifest-parser";
import { BlueprintSpec, ManifestV3Schema } from "./schemas";

export class ManifestV3Parser implements ManifestParser<ManifestV3Schema> {
  constructor(
    public uri: vscode.Uri,
    public contentJson: ManifestV3Schema,
  ) {}

  getDisplayName() {
    return this.contentJson.display_name;
  }

  getLuaPath(): string | undefined {
    if (this.opts?.file) {
      return this.opts.file;
    }

    if (this.opts?.dir) {
      return this.opts.dir;
    }
  }

  getBlueprintSpec(): BlueprintSpec {
    return BlueprintSpec.V3;
  }

  private get opts(): ManifestV3Schema["runtime"]["opts"] {
    return this.contentJson.runtime.opts;
  }
}
