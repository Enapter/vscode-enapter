import vscode, { CancellationError, CancellationToken, QuickPickItem, QuickPickItemKind } from "vscode";
import { SiteType } from "../models/sites/site";

class SiteTypeQuickPickItem implements QuickPickItem {
  kind = QuickPickItemKind.Default;

  constructor(
    public label: string,
    public siteType: SiteType,
    public detail?: string,
  ) {}
}

export class SitesSelectTypeTask {
  constructor() {}

  static async run(token?: CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new CancellationError();
    }

    return new SitesSelectTypeTask().run();
  }

  async run() {
    const selected = await this.showQuickPick();

    if (!selected) {
      throw new CancellationError();
    }

    return selected.siteType;
  }

  private get quickPickItems() {
    return [
      new SiteTypeQuickPickItem("Enapter Cloud Site", SiteType.Cloud, "Sites available on cloud.enapter.com"),
      new SiteTypeQuickPickItem("Enapter Gateway", SiteType.Gateway),
    ];
  }

  private async showQuickPick(): Promise<SiteTypeQuickPickItem | undefined> {
    return vscode.window.showQuickPick(this.quickPickItems, {
      placeHolder: "What do you want to add?",
      matchOnDetail: true,
    });
  }
}
