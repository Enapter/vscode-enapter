import vscode from "vscode";
import { GatewaySite } from "../../../models/sites/gateway-site";
import { ErrorNode } from "./error-node";
import { AddressNode } from "./address-node";
import { ApiTokenNode } from "./api-token-node";
import { EnapterGatewayIcon, WarningIcon } from "../../../ui/icons";
import { SitesConnectionsProvider } from "../provider";

export class GatewayNode extends vscode.TreeItem {
  error: string | undefined = undefined;

  constructor(
    private readonly provider: SitesConnectionsProvider,
    public site: GatewaySite,
    isActive: boolean,
  ) {
    super(site.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.setIcon(!!this.error);
    this.setContextValue(isActive);
    this.setDescription(isActive);
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const children: vscode.TreeItem[] = [];

    if (this.error && this.error !== "") {
      children.push(new ErrorNode(this.error));
    }

    children.push(new AddressNode(this.site.address));
    children.push(new ApiTokenNode(this.site));

    return children;
  }

  refresh() {
    this.provider.refresh(this);
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
