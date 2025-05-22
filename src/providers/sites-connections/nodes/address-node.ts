import vscode from "vscode";
import { GlobeIcon } from "../../../ui/icons";
import { GatewaySite } from "../../../models/sites/gateway-site";

export class AddressNode extends vscode.TreeItem {
  constructor(
    public readonly site: GatewaySite,
    address: string,
  ) {
    super(address);
    this.iconPath = new GlobeIcon();
    this.contextValue = "enapter.viewItems.GatewayAddressNode";
  }
}
