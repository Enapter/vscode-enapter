import { ProjectExplorer } from "../project-explorer";
import { Manifest } from "../manifest";
import { loggable, Logger } from "../logger";
import vscode, { CancellationError, CancellationToken, QuickPickItem, QuickPickItemKind } from "vscode";
import { ExtState } from "../ext-state";

interface ManifestQuickPickItem extends QuickPickItem {
  manifest?: Manifest;
}

export class PickManifestTask {
  constructor(
    private readonly state: ExtState = ExtState.instance,
    private readonly pe: ProjectExplorer = new ProjectExplorer(),
    private readonly logger: Logger = Logger.getInstance(),
  ) {}

  @loggable()
  async run(token?: CancellationToken): Promise<Manifest | undefined> {
    if (token?.isCancellationRequested) {
      throw new CancellationError();
    }

    try {
      const manifests = await this.getAllManifests();

      if (manifests.length === 0) {
        this.handleNoManifests();
        return;
      }

      const quickPickItems = await this.createQuickPickItems(manifests);
      const selected = await this.showQuickPick(quickPickItems);

      if (!selected) {
        return;
      }

      return manifests.find((m) => m.relativePath === selected.detail);
    } catch (e) {
      this.logger.error("Unhandled Error:", e);
    }
  }

  private async getAllManifests(): Promise<Manifest[]> {
    const manifests = await this.pe.findAllManifests();

    return manifests.map((m) => {
      this.logger.log(`Found manifest: ${m.path}`);
      return new Manifest(m);
    });
  }

  private handleNoManifests() {
    const message = "No manifest.yml found";
    this.logger.log(message);
    vscode.window.showErrorMessage(message);
  }

  private async createQuickPickItems(manifests: Manifest[]): Promise<ManifestQuickPickItem[]> {
    const items: Array<Promise<ManifestQuickPickItem>> = [];
    const persisted = this.state.getRecentManifest();
    const recent = manifests.find((m) => m.path.path === persisted?.path?.path);

    if (recent) {
      items.push(this.createSeparatorItem("Last used"));
      items.push(this.createManifestQuickPickItem(recent));
      items.push(this.createSeparatorItem(""));
    }

    const other = manifests.filter((m) => m.path.path !== recent?.path?.path);
    const otherItems = other.map((m) => this.createManifestQuickPickItem(m));
    items.push(...otherItems);

    return Promise.all(items);
  }

  private async showQuickPick(items: ManifestQuickPickItem[]): Promise<ManifestQuickPickItem | undefined> {
    return vscode.window.showQuickPick(items, {
      placeHolder: "Choose a manifest.yml file",
      matchOnDetail: true,
    });
  }

  private async createSeparatorItem(label: string): Promise<ManifestQuickPickItem> {
    return {
      label,
      kind: QuickPickItemKind.Separator,
    };
  }

  private async createManifestQuickPickItem(manifest: Manifest): Promise<ManifestQuickPickItem> {
    return new Promise((resolve) => {
      manifest.loadContent().then((m) => {
        resolve({
          label: m.displayName || m.name,
          detail: m.relativePath,
        });
      });
    });
  }
}
