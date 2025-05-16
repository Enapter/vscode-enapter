import vscode from "vscode";
import { GlobeIcon } from "../../../ui/icons";

export class AddressNode extends vscode.TreeItem {
  constructor(private readonly address: string) {
    super(address);
    this.iconPath = new GlobeIcon();
  }
}
