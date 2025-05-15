import vscode from "vscode";
import { PropertyIcon } from "../../ui/icons";

export class PropertyNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly value: string,
    public readonly iconPath = new PropertyIcon(),
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "enapter.viewItems.PropertyNode";
  }

  getPropertyValue() {
    return this.value;
  }
}
