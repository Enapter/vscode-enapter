import vscode from "vscode";
import { ExtState } from "../../ext-state";
import { CommandsNode } from "./nodes/commands-node";
import { LogsNode } from "./nodes/logs-node";
import { PropertyNode } from "../shared-nodes/property-node";
import { OnlineStatusNode } from "./nodes/online-status-node";
import { ActiveDeviceService } from "../../services/active-device-service";

type Node = vscode.TreeItem;

export class ActiveDeviceProvider implements vscode.TreeDataProvider<Node>, vscode.Disposable {
  private disposables: Array<vscode.Disposable> = [];
  private readonly state: ExtState;

  private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node>();
  readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;

  constructor(private readonly service: ActiveDeviceService) {
    this.state = ExtState.getInstance();

    this.disposables.push(
      this.service.onDidChangeDevice(() => {
        this.refresh(undefined);
      }),
    );
  }

  refresh(node: Node | undefined) {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(element: Node): Node {
    return element;
  }

  async getChildren(element?: Node): Promise<Array<Node>> {
    const device = this.service.getDevice();

    if (!device) {
      return [];
    }

    if (!element) {
      return [
        new OnlineStatusNode(device),
        new PropertyNode(`Name: ${device.name}`, device.name),
        new PropertyNode(`Slug: ${device.slug}`, device.slug),
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

  dispose() {
    vscode.Disposable.from(...this.disposables).dispose();
  }
}
