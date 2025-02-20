import { BlueprintManifest as _ManifestV1Schema } from "./v1";
import { BlueprintManifest as _ManifestV3Schema } from "./v3";

export type ManifestV1Schema = _ManifestV1Schema;
export type ManifestV3Schema = _ManifestV3Schema;
export type ManifestSchema = ManifestV1Schema | ManifestV3Schema;

export enum BlueprintSpec {
  V1 = "device/1.0",
  V3 = "device/3.0",
}
