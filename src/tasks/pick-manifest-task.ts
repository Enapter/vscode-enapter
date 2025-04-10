import { ProjectExplorer } from "../project-explorer";
import { LoadedManifest, Manifest } from "../models/manifests/manifest";
import { loggable, Logger } from "../logger";
import vscode, { CancellationError, CancellationToken, QuickPickItem, QuickPickItemKind } from "vscode";
import { ExtState } from "../ext-state";
import { BlueprintSpec } from "../models/manifests/schemas";

class ManifestQuickPickItem implements QuickPickItem {
  label: string;
  detail: string;
  kind: QuickPickItemKind;
  manifest?: LoadedManifest;

  constructor(label: string, detail: string, manifest?: LoadedManifest) {
    this.label = label;
    this.detail = detail;
    this.manifest = manifest;
    this.kind = QuickPickItemKind.Default;
  }

  get description() {
    switch (this.manifest?.blueprintSpec) {
      case BlueprintSpec.V1:
        return "Manifest V1";
      case BlueprintSpec.V3:
        return "Manifest V3";
      default:
        return undefined;
    }
  }
}

class SeparatorItem implements QuickPickItem {
  kind = QuickPickItemKind.Separator;

  constructor(public label: string) {}
}

type PickItem = ManifestQuickPickItem | SeparatorItem;

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

  private async createQuickPickItems(manifests: Manifest[]): Promise<PickItem[]> {
    const items: PickItem[] = [];

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

      items.push(...otherPickItems);
    } catch (_) {
      /* empty */
    }

    return items;
  }

  private async showQuickPick(items: PickItem[]): Promise<ManifestQuickPickItem | QuickPickItem | undefined> {
    return vscode.window.showQuickPick(items, {
      placeHolder: "Choose a manifest.yml file",
      matchOnDetail: true,
    });
  }

  private createSeparatorItem(label: string): SeparatorItem {
    return new SeparatorItem(label);
  }

  private async createManifestQuickPickItem(manifest?: Manifest): Promise<ManifestQuickPickItem | undefined> {
    if (!manifest) {
      return;
    }

    try {
      const m = await manifest.load();
      return new ManifestQuickPickItem(m.displayName, m.relativePath, m);
    } catch (_) {
      /* empty */
    }
  }
}
