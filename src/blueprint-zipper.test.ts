import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, use } from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import { LoadedManifest, Manifest } from "./models/manifests/manifest";
import vscode from "vscode";
import { BlueprintZipper } from "./blueprint-zipper";
import JSZip from "jszip";

use(sinonChai);
use(chaiAsPromised);

const getExpectations = async <T = unknown>(cb: (content: any) => T) => {
  const uri = await vscode.workspace.findFiles("test-expectations.json");
  const content = await vscode.workspace.fs.readFile(uri[0]);
  const json = JSON.parse(Buffer.from(content).toString("utf8"));
  return cb(json);
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

  return new BlueprintZipper(manifest);
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
    const entries = Object.keys(content.files);
    const expectedEntries = await getExpectations<string[]>((c: any) => c.BlueprintZipper.zip.shouldReturnArchiveWith);
    expect(entries).to.have.members(expectedEntries);
  });
});
