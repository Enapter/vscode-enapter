import { suite, test, expect, vi } from "vitest";
import { BlueprintSpec, ManifestV1Schema } from "./schemas";
import { ManifestV1Parser } from "./manifest-v1-parser";

vi.mock("vscode", () => {
  return {
    Uri: {
      file: (path: string) => {
        return { path };
      },
    },
  };
});

suite("ManifestV1Parser", () => {
  const minimalContent: ManifestV1Schema = {
    blueprint_spec: "device/1.0",
    display_name: "Minimal V1 Manifest",
  };

  test("returns display name", () => {
    expect(new ManifestV1Parser(minimalContent).getDisplayName()).to.equal(minimalContent.display_name);
  });

  test("returns blueprint spec", () => {
    expect(new ManifestV1Parser(minimalContent).getBlueprintSpec()).to.equal(BlueprintSpec.V1);
  });

  suite("getRockspecFilename", () => {
    const withRockspec = (rockspec: any) => {
      return {
        ...minimalContent,
        communication_module: {
          product: "",
          lua: {
            rockspec,
          },
        },
      };
    };

    test("returns rockspec filename", () => {
      expect(new ManifestV1Parser(withRockspec("test-rockspec")).getRockspecFilename()).to.equal("test-rockspec");
    });

    test("returns undefined if no rockspec specified", () => {
      expect(new ManifestV1Parser(withRockspec(undefined)).getRockspecFilename()).to.equal(undefined);
    });

    test("returns undefined if no lua field in manifest", () => {
      expect(new ManifestV1Parser(minimalContent).getRockspecFilename()).to.equal(undefined);
    });
  });

  suite("getLuaPath", () => {
    test("returns lua_path", () => {
      const content = {
        ...minimalContent,
        communication_module: {
          product: "",
          lua_file: "path",
        },
      };
      expect(new ManifestV1Parser(content).getLuaPath()).to.equal("path");
    });

    test("returns lua file", () => {
      const content = {
        ...minimalContent,
        communication_module: {
          product: "",
          lua: {
            file: "some-file",
          },
        },
      };
      expect(new ManifestV1Parser(content).getLuaPath()).to.equal("some-file");
    });

    test("returns lua dir", () => {
      const content = {
        ...minimalContent,
        communication_module: {
          product: "",
          lua: {
            dir: "some-dir",
          },
        },
      };
      expect(new ManifestV1Parser(content).getLuaPath()).to.equal("some-dir");
    });

    test("returns lua file if file and dir are present", () => {
      const content = {
        ...minimalContent,
        communication_module: {
          product: "",
          lua: {
            file: "some-file",
            dir: "some-dir",
          },
        },
      };
      expect(new ManifestV1Parser(content).getLuaPath()).to.equal("some-file");
    });

    test("returns undefined if lua property is present and file or dir are not", () => {
      const content = {
        ...minimalContent,
        communication_module: {
          product: "",
          lua: {},
        },
      };
      expect(new ManifestV1Parser(content).getLuaPath()).to.equal(undefined);
    });
  });
});
