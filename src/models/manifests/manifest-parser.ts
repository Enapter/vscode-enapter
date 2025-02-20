import { ManifestSchema } from "./schemas";

export interface ManifestParser<T extends ManifestSchema = ManifestSchema> {
  contentJson: T;
  getLuaPath(): string | undefined;
  getDisplayName(): T["display_name"];
}
