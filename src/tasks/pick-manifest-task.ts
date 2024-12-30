import { ProjectExplorer } from "../project-explorer";
import { Manifest } from "../manifest";
import { loggable, Logger } from "../logger";
import vscode, { QuickPickItem, QuickPickItemKind } from "vscode";
import { ExtState } from "../ext-state";
import { ExtContext } from "../ext-context";

function getDetail(manifest: Manifest): string | undefined {
  return manifest.relativePath;
}

function getManifestsPicks(manifests: Manifest[], recentManifest: Manifest | undefined): Thenable<QuickPickItem[]> {
  const list: Promise<QuickPickItem>[] = [];

  const recentManifestInList = manifests.find((m) => m.fsPath === recentManifest?.fsPath);

  if (recentManifestInList) {
    list.push(
      new Promise((resolve) => {
        resolve({
          label: "Last used",
          kind: QuickPickItemKind.Separator,
        });
      }),
    );

    list.push(
      new Promise((resolve) => {
        resolve(
          recentManifestInList.loadContent().then((m) => {
            return {
              label: m.displayName || m.name,
              detail: getDetail(recentManifestInList),
            };
          }),
        );
      }),
    );
  }

  const filtered = manifests.filter((m) => {
    if (!recentManifestInList) {
      return true;
    }

    return m.fsPath !== recentManifestInList.fsPath;
  });

  if (filtered.length === 0) {
    return Promise.all(list);
  }

  if (recentManifestInList) {
    list.push(
      new Promise((resolve) => {
        resolve({
          label: "",
          kind: QuickPickItemKind.Separator,
        });
      }),
    );
  }

  filtered.forEach((m) => {
    list.push(
      new Promise((resolve) => {
        resolve(
          m.loadContent().then((manifest) => {
            return {
              label: manifest.displayName || manifest.name,
              detail: getDetail(m),
            };
          }),
        );
      }),
    );
  });

  return Promise.all(list);
}

export class PickManifestTask {
  constructor(
    private readonly pe: ProjectExplorer = new ProjectExplorer(),
    private readonly logger: Logger = Logger.getInstance(),
  ) {}

  @loggable()
  async run(): Promise<Manifest | undefined> {
    return new Promise(async (resolve) => {
      try {
        const state = new ExtState(ExtContext.context);
        const manifests = await this.getAllManifests();

        if (manifests.length === 0) {
          this.logger.log("No manifest.yml found");
          vscode.window.showErrorMessage("No manifest.yml found");
          resolve(undefined);
          return;
        }

        const recent = state.getRecentManifest();

        const selected = await vscode.window.showQuickPick(getManifestsPicks(manifests, recent), {
          placeHolder: "Choose a manifest.yml file",
          matchOnDetail: true,
        });

        if (!selected) {
          resolve(undefined);
          return;
        }

        const manifest = manifests.find((m) => m.relativePath === selected.detail);

        resolve(manifest);
      } catch (e) {
        this.logger.error("Unhandled Error:", e);
        resolve(undefined);
      }
    });
  }

  private async getAllManifests() {
    return this.pe.findAllManifests().then((ms) => {
      const manifests: Manifest[] = [];

      ms.forEach((m) => {
        this.logger.log(`Found manifest: ${m.path}`);
        manifests.push(new Manifest(m));
      });

      return manifests;
    });
  }
}
