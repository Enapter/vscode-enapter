import { describe, it, beforeEach, afterEach } from "mocha";
import { use, expect } from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import { LoadedManifest, Manifest } from "./models/manifests/manifest";
import vscode from "vscode";
import sinon from "sinon";
import { ILogger } from "./logger";
import { BlueprintZipper } from "./blueprint-zipper";
import JSZip from "jszip";

use(sinonChai);
use(chaiAsPromised);

const MockLogger: ILogger = {
  log: sinon.fake((...args: any[]) => {
    console.log(...args);
  }),
  error: sinon.fake((...args: any[]) => {
    console.log(...args);
  }),
  group: sinon.fake(),
  groupEnd: sinon.fake(),
};

const withWsPath = (path: string): vscode.Uri => {
  const dirs = vscode.workspace.workspaceFolders;

  if (!dirs) {
    throw new Error("No workspace folder found");
  }

  return vscode.Uri.joinPath(dirs[0].uri, path);
};

const createZipper = (manifest: LoadedManifest | undefined) => {
  if (!manifest) {
    throw new Error("Manifest is undefined");
  }

  return new BlueprintZipper(manifest, MockLogger);
};

describe("BlueprintZipper", () => {
  let manifest: Manifest | undefined;
  let loadedManifest: LoadedManifest | undefined;

  beforeEach(async () => {
    manifest = new Manifest(withWsPath("manifest.yml"));
    loadedManifest = await manifest.load();
  });

  afterEach(() => {
    manifest = undefined;
    loadedManifest = undefined;
  });

  it("should zip loaded manifest", async () => {
    const zipper = createZipper(loadedManifest);
    await expect(zipper.zip()).to.eventually.fulfilled;
  });

  it("should contain manifest.yml and lua in an archive", async () => {
    const zipper = createZipper(loadedManifest);
    const archive = await zipper.zip();
    const content = await new JSZip().loadAsync(archive);
    expect(content.files["manifest.yml"]).to.exist;
    expect(content.files["main.lua"]).to.exist;
  });
});
