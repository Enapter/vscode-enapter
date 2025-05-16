import vscode from "vscode";
import { CloudSite } from "../../../models/sites/cloud-site";
import { GatewaySite } from "../../../models/sites/gateway-site";
import { KeyIcon } from "../../../ui/icons";
import { ExtState } from "../../../ext-state";
import { SiteType } from "../../../models/sites/site";

export class ApiTokenNode extends vscode.TreeItem {
  constructor(
    private site: CloudSite | GatewaySite,
    private readonly extState: ExtState = ExtState.getInstance(),
  ) {
    super("API Token: [hidden]", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new KeyIcon();
    this.contextValue = "enapter.viewItems.ApiTokenProperty";
  }

  async getPropertyValue() {
    const token =
      this.site.type === SiteType.Cloud
        ? await this.extState.getCloudApiToken()
        : await this.extState.getGatewayApiToken(this.site);

    return token || "";
  }
}
