import { suite, test, expect, vi } from "vitest";
import { BlueprintSpec, ManifestV3Schema } from "./schemas";
import { ManifestV3Parser } from "./manifest-v3-parser";
import { set } from "es-toolkit/compat";

vi.mock("vscode", () => {
  return {
    Uri: {
      file: (path: string) => {
        return { path };
      },
    },
  };
});

suite("ManifestV3Parser", () => {
  const minimalContent: ManifestV3Schema = {
    blueprint_spec: "device/3.0",
    display_name: "Minimal V3 Manifest",
    runtime: {
      type: "lua",
    },
  };

  const withOptions = (options: ManifestV3Schema["runtime"]["options"]): ManifestV3Schema => {
    return set(minimalContent, "runtime.options", options);
  };

  test("should return display name", () => {
    expect(new ManifestV3Parser(minimalContent).getDisplayName()).to.equal(minimalContent.display_name);
  });

  test("should return blueprint spec", () => {
    expect(new ManifestV3Parser(minimalContent).getBlueprintSpec()).to.equal(BlueprintSpec.V3);
  });

  suite("getRockspecFilename", () => {
    test("should return rockspec filename", () => {
      const parser = new ManifestV3Parser(withOptions({ rockspec: "test-rockspec" }));
      expect(parser.getRockspecFilename()).to.equal("test-rockspec");
    });

    test("should return undefined if no rockspec specified", () => {
      const parser = new ManifestV3Parser(withOptions({}));
      expect(parser.getRockspecFilename()).to.equal(undefined);
    });
  });

  suite("getLuaPath", () => {
    test("should return lua file", () => {
      const parser = new ManifestV3Parser(withOptions({ file: "some-file" }));
      expect(parser.getLuaPath()).to.equal("some-file");
    });

    test("should return lua dir", () => {
      const parser = new ManifestV3Parser(withOptions({ dir: "some-dir" }));
      expect(parser.getLuaPath()).to.equal("some-dir");
    });

    test("should return lua file if file and dir are present", () => {
      const parser = new ManifestV3Parser(withOptions({ file: "some-file", dir: "some-dir" }));
      expect(parser.getLuaPath()).to.equal("some-file");
    });

    test("should return undefined if options property is present and file or dir are not", () => {
      const parser = new ManifestV3Parser(withOptions({}));
      expect(parser.getLuaPath()).to.equal(undefined);
    });
  });
});
