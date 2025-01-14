import vscode from "vscode";
import JSZip from "jszip";

export class EnbpContentFileProvider {
  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const enbpUri = vscode.Uri.parse(`enbp-content-file:/?${uri.fsPath}`);
    const archiveUri = vscode.Uri.parse(enbpUri.query);
    const zip = await new JSZip().loadAsync(await vscode.workspace.fs.readFile(archiveUri));
    const entry = zip.file(uri.path.slice("/".length));

    if (!entry) {
      throw vscode.FileSystemError.FileNotFound();
    }

    return new TextDecoder().decode(await entry.async("uint8array"));
  }
}
