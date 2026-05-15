import * as vscode from "vscode";

export async function detectBlueprintVersionDirs(): Promise<string[]> {
    const defaultVersion = "v3";
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders?.length) {
        return [defaultVersion];
    }

    const versions = new Set<string>();

    for (const folder of workspaceFolders) {
        const manifests = await vscode.workspace.findFiles(
            new vscode.RelativePattern(folder, "**/manifest.yml"),
            "**/node_modules/**",
            20,
        );
    
        for (const uri of manifests) {
            try {
                const doc = await vscode.workspace.openTextDocument(uri);
                const match = doc.getText().match(/blueprint_spec:\s*device\/(\d+)/);
                if (match) versions.add(match[1] === "3" ? "v3" : "v1");
            } catch {
                // ignore unreadable manifests
            }
        }
    }

    return versions.size > 0 ? Array.from(versions) : [defaultVersion];
}