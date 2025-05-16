import vscode from "vscode";
import { CloudSite } from "../../../models/sites/cloud-site";
import { ApiTokenNode } from "./api-token-node";
import { EnapterGatewayIcon, WarningIcon } from "../../../ui/icons";
import { SitesConnectionsProvider } from "../provider";

export class CloudSiteNode extends vscode.TreeItem {
  error: string | undefined = undefined;

  constructor(
    private readonly provider: SitesConnectionsProvider,
    public site: CloudSite,
    isActive: boolean,
  ) {
    super(site.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.setIcon(!!this.error);
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  refresh() {
    this.provider.refresh(this);
  }

  getChildren(): vscode.TreeItem[] {
    return [!!this.error && { label: `Error: ${this.error}` }, new ApiTokenNode(this.site)].filter((i) => !!i);
  }

  setError(message: string | undefined) {
    this.error = message;
    this.setIcon(!!message);
  }

  setIcon(isInvalid: boolean) {
    this.iconPath = isInvalid ? new WarningIcon() : new EnapterGatewayIcon();
  }

  setContextValue(isActive: boolean) {
    this.contextValue = isActive ? "enapter.viewItems.ActiveSite" : "enapter.viewItems.Site";
  }

  setDescription(isActive: boolean) {
    this.description = isActive ? "Active" : undefined;
  }
}
