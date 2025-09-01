import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, use } from "chai";
import sinon from "sinon";
import vscode from "vscode";
import yaml from "js-yaml";
import { LoadedManifest, Manifest, SerializedManifest } from "./manifest";
import { BlueprintSpec, ManifestV1Schema, ManifestV3Schema } from "./schemas";
import { InvalidBlueprintManifestError, InvalidManifestLuaPathError, ManifestNotLoadedError } from "./manifest-errors";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";

use(sinonChai);
use(chaiAsPromised);

describe("Manifest", () => {
  let mockUri: sinon.SinonStubbedInstance<vscode.Uri>;
  let mockYamlLoad: sinon.SinonStub;

  const validV1Manifest: ManifestV1Schema = {
    blueprint_spec: "device/1.0",
    display_name: "Test V1 Device",
    communication_module: {
      product: "test-product",
      lua_file: "main.lua",
    },
  };

  const validV3Manifest: ManifestV3Schema = {
    blueprint_spec: "device/3.0",
    display_name: "Test V3 Device",
    runtime: {
      type: "lua",
      options: {
        file: "main.lua",
      },
    },
  };

  beforeEach(() => {
    mockUri = {
      fsPath: "/test/path/manifest.yml",
      path: "/test/path/manifest.yml",
      toString: sinon.stub().returns("file:///test/path/manifest.yml"),
    } as any;

    vscode.Uri.joinPath = sinon.stub().returns(mockUri);
    vscode.Uri.parse = sinon.stub().returns(mockUri);

    sinon.stub(vscode.workspace, "fs").value({
      readFile: sinon.stub().resolves(new TextEncoder().encode("test content")),
    });

    sinon.stub(vscode.workspace, "asRelativePath").returns("manifest.yml");

    mockYamlLoad = sinon.stub(yaml, "load");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create manifest with uri", () => {
    const manifest = new Manifest(mockUri as any);
    expect(manifest.uri).to.equal(mockUri);
  });

  describe("static methods", () => {
    describe("isManifest", () => {
      it("should return true for valid V1 manifest", () => {
        expect(Manifest.isManifest(validV1Manifest)).to.equal(true);
      });

      it("should return true for valid V3 manifest", () => {
        expect(Manifest.isManifest(validV3Manifest)).to.equal(true);
      });

      it("should return false for null", () => {
        expect(Manifest.isManifest(null)).to.equal(false);
      });

      it("should return false for undefined", () => {
        expect(Manifest.isManifest(undefined)).to.equal(false);
      });

      it("should return false for non-object", () => {
        expect(Manifest.isManifest("string")).to.equal(false);
        expect(Manifest.isManifest(123)).to.equal(false);
      });

      it("should return false for object without blueprint_spec", () => {
        expect(Manifest.isManifest({ display_name: "Test" })).to.equal(false);
      });

      it("should return false for object with invalid blueprint_spec", () => {
        expect(Manifest.isManifest({ blueprint_spec: "invalid/1.0" })).to.equal(false);
      });
    });

    describe("isV1", () => {
      it("should return true for V1 manifest", () => {
        expect(Manifest.isV1(validV1Manifest)).to.equal(true);
      });

      it("should return false for V3 manifest", () => {
        expect(Manifest.isV1(validV3Manifest)).to.equal(false);
      });

      it("should return false for invalid manifest", () => {
        expect(Manifest.isV1({ invalid: "data" })).to.equal(false);
      });
    });

    describe("isV3", () => {
      it("should return true for V3 manifest", () => {
        expect(Manifest.isV3(validV3Manifest)).to.equal(true);
      });

      it("should return false for V1 manifest", () => {
        expect(Manifest.isV3(validV1Manifest)).to.equal(false);
      });

      it("should return false for invalid manifest", () => {
        expect(Manifest.isV3({ invalid: "data" })).to.equal(false);
      });
    });

    describe("deserialize", () => {
      it("should create manifest from serialized data", () => {
        const serialized: SerializedManifest = {
          uri: "file:///test/path/manifest.yml",
        };

        const manifest = Manifest.deserialize(serialized);
        expect(manifest).to.be.instanceOf(Manifest);
      });
    });
  });

  describe("instance methods", () => {
    let manifest: Manifest;

    beforeEach(() => {
      manifest = new Manifest(mockUri as any);
    });

    describe("serialize", () => {
      it("should return serialized representation", () => {
        const result = manifest.serialize();
        expect(result).to.deep.equal({
          uri: "file:///test/path/manifest.yml",
        });
      });
    });

    describe("load", () => {
      it("should load and parse V1 manifest successfully", async () => {
        mockYamlLoad.returns(validV1Manifest);

        const result = await manifest.load();

        expect(vscode.workspace.fs.readFile).to.have.been.calledWith(mockUri);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(mockYamlLoad).to.have.been.called;
        expect(manifest.contentStr).to.equal("test content");
        expect(manifest.contentJson).to.deep.equal(validV1Manifest);
        expect(result).to.equal(manifest);
        expect(result).to.satisfy((m: any): m is LoadedManifest => {
          return (
            m.blueprintSpec !== undefined &&
            m.contentStr !== undefined &&
            m.contentJson !== undefined &&
            m.displayName !== undefined &&
            m.luaPath !== undefined
          );
        });
      });

      it("should load and parse V3 manifest successfully", async () => {
        mockYamlLoad.returns(validV3Manifest);

        const result = await manifest.load();

        expect(manifest.contentJson).to.deep.equal(validV3Manifest);
        expect(result).to.equal(manifest);
      });

      it("should throw InvalidBlueprintManifestError for invalid manifest", async () => {
        mockYamlLoad.returns({ invalid: "data" });
        await expect(manifest.load()).to.be.eventually.rejectedWith(InvalidBlueprintManifestError);
      });

      it("should throw InvalidBlueprintManifestError for unsupported spec", async () => {
        mockYamlLoad.returns({ blueprint_spec: "device/2.0" });
        await expect(manifest.load()).to.be.eventually.rejectedWith(InvalidBlueprintManifestError);
      });
    });

    describe("filename", () => {
      it("should return filename from uri path", () => {
        expect(manifest.filename).to.equal("manifest.yml");
      });

      it("should handle path without directory", () => {
        // @ts-expect-error mockUri is a stub, so we can set properties directly
        mockUri.fsPath = "manifest.yml";
        expect(manifest.filename).to.equal("manifest.yml");
      });
    });

    describe("relativePath", () => {
      it("should return relative path from workspace", () => {
        expect(manifest.relativePath).to.equal("manifest.yml");
        expect(vscode.workspace.asRelativePath).to.have.been.calledWith(mockUri);
      });
    });

    describe("getters requiring loaded manifest", () => {
      beforeEach(async () => {
        mockYamlLoad.returns(validV1Manifest);
        await manifest.load();
      });

      describe("luaUri", () => {
        it("should return joined path for lua file", () => {
          expect(manifest.luaUri).to.equal(mockUri);
          expect(vscode.Uri.joinPath).to.have.been.calledWith(mockUri, "main.lua");
        });
      });

      describe("luaFsPath", () => {
        it("should return filesystem path for lua file", () => {
          expect(manifest.luaFsPath).to.equal("/test/path/main.lua");
        });
      });

      describe("luaPath", () => {
        it("should return lua path from parser", () => {
          expect(manifest.luaPath).to.equal("main.lua");
        });

        it("should throw InvalidManifestLuaPathError when lua path is invalid", async () => {
          const invalidManifest = { ...validV1Manifest };
          delete (invalidManifest as any).communication_module.lua_file;
          mockYamlLoad.returns(invalidManifest);

          const newManifest = new Manifest(mockUri as any);
          await newManifest.load();

          expect(() => newManifest.luaPath).to.throw(InvalidManifestLuaPathError);
        });
      });

      describe("displayName", () => {
        it("should return display name from parser", () => {
          expect(manifest.displayName).to.equal("Test V1 Device");
        });
      });

      describe("blueprintSpec", () => {
        it("should return blueprint spec from parser", () => {
          expect(manifest.blueprintSpec).to.equal(BlueprintSpec.V1);
        });
      });

      describe("rockspec", () => {
        it("should return undefined for manifest without rockspec", () => {
          expect(manifest.rockspec).to.equal(undefined);
        });

        it("should return rockspec filename when present", async () => {
          const manifestWithRockspec = {
            ...validV1Manifest,
            communication_module: {
              ...validV1Manifest.communication_module,
              lua: {
                rockspec: "test.rockspec",
              },
            },
          };
          mockYamlLoad.returns(manifestWithRockspec);

          const newManifest = new Manifest(mockUri as any);
          await newManifest.load();

          expect(newManifest.rockspec).to.equal("test.rockspec");
        });
      });

      describe("rockspecPath", () => {
        it("should return undefined when no rockspec", () => {
          expect(manifest.rockspecPath).to.equal(undefined);
        });

        it("should return full path when rockspec exists", async () => {
          const manifestWithRockspec = {
            ...validV1Manifest,
            communication_module: {
              ...validV1Manifest.communication_module,
              lua: {
                rockspec: "test.rockspec",
              },
            },
          };
          mockYamlLoad.returns(manifestWithRockspec);

          const newManifest = new Manifest(mockUri as any);
          await newManifest.load();

          expect(newManifest.rockspecPath).to.equal("/test/path/test.rockspec");
        });
      });
    });

    describe("error handling for unloaded manifest", () => {
      it("should throw ManifestNotLoadedError for luaPath when not loaded", () => {
        expect(() => manifest.luaPath).to.throw(ManifestNotLoadedError);
      });

      it("should throw ManifestNotLoadedError for displayName when not loaded", () => {
        expect(() => manifest.displayName).to.throw(ManifestNotLoadedError);
      });

      it("should throw ManifestNotLoadedError for blueprintSpec when not loaded", () => {
        expect(() => manifest.blueprintSpec).to.throw(ManifestNotLoadedError);
      });

      it("should throw ManifestNotLoadedError for rockspec when not loaded", () => {
        expect(() => manifest.rockspec).to.throw(ManifestNotLoadedError);
      });
    });
  });

  describe("V3 manifest specific tests", () => {
    let manifest: Manifest;

    beforeEach(async () => {
      manifest = new Manifest(mockUri as any);
      mockYamlLoad.returns(validV3Manifest);
      await manifest.load();
    });

    it("should handle V3 manifest properties", () => {
      expect(manifest.blueprintSpec).to.equal(BlueprintSpec.V3);
      expect(manifest.displayName).to.equal("Test V3 Device");
      expect(manifest.luaPath).to.equal("main.lua");
    });
  });

  describe("edge cases and error scenarios", () => {
    it("should handle file reading errors", async () => {
      const manifest = new Manifest(mockUri as any);
      await expect(manifest.load()).to.be.eventually.rejectedWith(Error);
    });

    it("should handle YAML parsing errors", async () => {
      const yamlError = new Error("Invalid YAML");
      mockYamlLoad.throws(yamlError);

      const manifest = new Manifest(mockUri as any);
      await expect(manifest.load()).to.be.eventually.rejectedWith(Error);
    });

    it("should handle paths with special characters", () => {
      // @ts-expect-error mockUri is a stub, so we can set properties directly
      mockUri.fsPath = "/test/path with spaces/manifest.yml";
      const manifest = new Manifest(mockUri as any);
      expect(manifest.filename).to.equal("manifest.yml");
    });

    it("should handle empty path", () => {
      // @ts-expect-error mockUri is a stub, so we can set properties directly
      mockUri.fsPath = "";
      const manifest = new Manifest(mockUri as any);
      expect(manifest.filename).to.equal("");
    });
  });
});
