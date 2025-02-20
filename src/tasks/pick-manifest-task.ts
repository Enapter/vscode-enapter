import { ProjectExplorer } from "../project-explorer";
import { LoadedManifest, Manifest } from "../models/manifests/manifest";
import { loggable, Logger } from "../logger";
import vscode, { CancellationError, CancellationToken, QuickPickItem, QuickPickItemKind } from "vscode";
import { ExtState } from "../ext-state";
import { ManifestError } from "../models/manifests/manifest-errors";

interface ManifestQuickPickItem extends QuickPickItem {
  manifest?: LoadedManifest;
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
    const items: Array<ManifestQuickPickItem> = [];

    try {
      const persisted = this.state.getRecentManifest();
      const recent = manifests.find((m) => m.uri.path === persisted?.uri?.path);
      const recentPickItem = await this.createManifestQuickPickItem(recent);

      if (recent && recentPickItem) {
        items.push(this.createSeparatorItem("Last used"));
        items.push(recentPickItem);
        items.push(this.createSeparatorItem(""));
      }

      const other = manifests.filter((m) => m.uri.path !== recent?.uri?.path);
      const maybeOtherPickItems = await Promise.allSettled(other.map((m) => this.createManifestQuickPickItem(m)));

      const otherPickItems = maybeOtherPickItems
        .filter((i) => i.status === "fulfilled")
        .map((i) => i.value)
        .filter((i) => !!i);

      otherPickItems.forEach((i) => {
        console.log("item", i.manifest?.uri?.path);
      });

      items.push(...otherPickItems);
    } catch (e) {}

    return items;
  }

  private async showQuickPick(items: ManifestQuickPickItem[]): Promise<ManifestQuickPickItem | undefined> {
    return vscode.window.showQuickPick(items, {
      placeHolder: "Choose a manifest.yml file",
      matchOnDetail: true,
    });
  }

  private createSeparatorItem(label: string): ManifestQuickPickItem {
    return {
      label,
      kind: QuickPickItemKind.Separator,
    };
  }

  private async createManifestQuickPickItem(manifest?: Manifest): Promise<ManifestQuickPickItem | undefined> {
    if (!manifest) {
      return;
    }

    try {
      const m = await manifest.load();
      return {
        label: m.displayName,
        detail: m.relativePath,
        manifest: m,
      };
    } catch (e) {
      if (ManifestError.isManifestError(e)) {
        e.showErrorMessage();
      }
    }
  }
}
