import JSZip from "jszip";

export class JSZipTools {
  static createNode(name: string, type: JSZipTools.FileType): JSZipTools.TreeNode {
    return {
      name,
      type,
      children: [],
      size: 0,
      path: "",
    };
  }

  static buildTree(paths: JSZipTools.ZipPath[]): JSZipTools.TreeNode {
    const root = JSZipTools.createNode("root", JSZipTools.FileType.Dir);

    paths.forEach((path) => {
      const parts = path.name.split("/");
      let currentNode = root;

      parts.forEach((part, index) => {
        if (!part || part === "") {
          return;
        }

        const isFile = index === parts.length - 1 && !path.dir;
        const type = isFile ? JSZipTools.FileType.File : JSZipTools.FileType.Dir;
        let node = currentNode.children.find((child) => child.name === part);

        if (!node) {
          node = JSZipTools.createNode(part, type);
          node.path = parts.slice(0, index + 1).join("/");

          if (isFile) {
            node.size = path.size || 0;
          }

          currentNode.children.push(node);
        }

        currentNode = node;
      });
    });

    return root;
  }

  static async zipToTree(zip: JSZip): Promise<JSZipTools.TreeNode> {
    try {
      const paths: JSZipTools.ZipPath[] = [];

      zip.forEach((relativePath, file) => {
        paths.push({
          name: relativePath,
          dir: file.dir,
          // @ts-expect-error _data is not defined in the type
          size: file._data ? file._data.uncompressedSize : 0,
        });
      });

      const tree = JSZipTools.buildTree(paths);
      return tree;
    } catch (error) {
      console.error("Error processing zip file:", error);
      throw error;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSZipTools {
  export enum FileType {
    File,
    Dir,
  }

  export interface TreeNode {
    name: string;
    type: FileType.File | FileType.Dir;
    children: TreeNode[];
    size: number;
    path: string;
  }

  export interface ZipPath {
    name: string;
    dir: boolean;
    size: number;
  }
}
