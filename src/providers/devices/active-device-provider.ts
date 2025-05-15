import vscode from "vscode";
import { ExtState } from "../../ext-state";
import { CommandsNode } from "./nodes/commands-node";
import { LogsNode } from "./nodes/logs-node";
import { PropertyNode } from "../shared-nodes/property-node";
import { OnlineStatusNode } from "./nodes/online-status-node";

type Node = vscode.TreeItem;

export class ActiveDeviceProvider implements vscode.TreeDataProvider<Node> {
  private readonly state: ExtState;

  private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node>();
  readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    this.state = ExtState.getInstance();
    this.state.onDidChangeDevices(() => this.refresh(undefined));
    this.state.onDidChangeActiveDevice(() => this.refresh(undefined));
    this.state.onDidActivateSite(() => this.refresh(undefined));
  }

  refresh(node: Node | undefined) {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(element: Node): Node {
    return element;
  }

  async getChildren(element?: Node): Promise<Array<Node>> {
    const device = this.state.getActiveDevice();
    const site = this.state.getActiveSite();

    if (!device || !site) {
      return [];
    }

    if (!element) {
      return [
        new OnlineStatusNode(device),
        new PropertyNode(`Name: ${device.name}`, device.name),
        new PropertyNode(`ID: ${device.id}`, device.id),
        new LogsNode(this, device),
        new CommandsNode(device),
      ];
    }

    if ("getChildren" in element && typeof element.getChildren === "function") {
      return element.getChildren();
    }

    return [];
  }
}
