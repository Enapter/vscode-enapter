import vscode from "vscode";
import { ExtState } from "./ext-state";
import { ProjectExplorer } from "./project-explorer";
import JSZip from "jszip";
import { JSZipTools } from "./utils/jszip-tools";

enum Level {
  Root,
  Nested,
}

export class EnbpFileTreeItem extends vscode.TreeItem {
  private zip?: JSZip;

  constructor(
    public readonly uri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private node?: JSZipTools.TreeNode,
    level: Level = Level.Nested,
  ) {
    super(level === Level.Root ? uri : vscode.Uri.parse(node?.name || ""), collapsibleState);

    if (node) {
      this.node = node;
      this.contextValue = this.getContextValue(node.type);

      if (this.isFile(node)) {
        this.iconPath = new vscode.ThemeIcon("file");
      } else {
        this.iconPath = new vscode.ThemeIcon("folder");
      }

      if (this.isFile(node)) {
        this.command = {
          command: "enapter.commands.Enbp.OpenTreeItem",
          title: "Open File",
          arguments: [vscode.Uri.parse(`enbp:/${node.path}?${this.uri.fsPath}`)],
        };
      }
    }
  }

  async getChildren(): Promise<EnbpFileTreeItem[]> {
    try {
      if (this.node) {
        return this.node.children.map(
          (childNode) =>
            new EnbpFileTreeItem(
              this.uri,
              this.isFile(childNode) ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
              childNode,
            ),
        );
      }

      if (!this.zip) {
        const zipData = await vscode.workspace.fs.readFile(this.uri);
        this.zip = await new JSZip().loadAsync(zipData);
      }

      const root = await JSZipTools.zipToTree(this.zip);

      this.node = root;

      return root.children.map(
        (childNode) =>
          new EnbpFileTreeItem(
            this.uri,
            this.isFile(childNode) ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
            childNode,
          ),
      );
    } catch (error) {
      console.error("Error getting children:", error);
      return [];
    }
  }

  private getContextValue(v: any) {
    if (v === JSZipTools.FileType.File) {
      return "file";
    }

    if (v === JSZipTools.FileType.Dir) {
      return "directory";
    }

    return String(v);
  }

  private isFile(node: JSZipTools.TreeNode) {
    return node.type === JSZipTools.FileType.File;
  }
}

export class EnbpFilesTreeView implements vscode.TreeDataProvider<EnbpFileTreeItem> {
  private readonly state: ExtState;
  private _onDidChangeTreeData: vscode.EventEmitter<EnbpFileTreeItem | undefined> = new vscode.EventEmitter<
    EnbpFileTreeItem | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<EnbpFileTreeItem | undefined> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
    this.state = new ExtState(context);
    this.state.onDidChangeDevices(() => this.refresh());
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: EnbpFileTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: EnbpFileTreeItem): Promise<EnbpFileTreeItem[]> {
    if (element) {
      return element.getChildren();
    }

    return new Promise((resolve) => {
      this.pe
        .findAllEnbpFiles()
        .then((uris) =>
          resolve(
            uris.map(
              (uri) => new EnbpFileTreeItem(uri, vscode.TreeItemCollapsibleState.Collapsed, undefined, Level.Root),
            ),
          ),
        );
    });
  }

  private get pe() {
    return new ProjectExplorer();
  }
}
