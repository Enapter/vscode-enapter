import * as vscode from "vscode";
import { detectBlueprintVersionDirs } from "./detect-blueprint-version-dirs";

const ENAPTER_LUA_GLOBALS = [
    // shared (v1 + v3)
    "enapter", "scheduler", "storage", "system",
    // v1 only
    "led", "modbus", "rs232", "rs485", "can", "rl6", "ai4", "di7",
    // v3 only
    "configuration", "json", "http",
    "serial", "relay", "digitalin", "digitalout", "analogin", "analogout",
];

export async function configureLuaLibrary(context: vscode.ExtensionContext): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const resource = workspaceFolder?.uri;

    const target = workspaceFolder
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;

    // Always register Enapter globals so Lua LS doesn't flag them as undefined,
    // even if workspace.library fails to load (e.g. after fresh install).
    const diagConfig = resource
        ? vscode.workspace.getConfiguration("Lua", resource)
        : vscode.workspace.getConfiguration("Lua");

    const existingGlobals: string[] = diagConfig.get("diagnostics.globals") ?? [];
    const globalsToAdd = ENAPTER_LUA_GLOBALS.filter(g => !existingGlobals.includes(g));

    if (globalsToAdd.length > 0) {
        try {
            await diagConfig.update("diagnostics.globals", [...existingGlobals, ...globalsToAdd], target);
        } catch {
            // ignore
        }
    }

    // Show install prompt if sumneko.lua is missing.
    if (!vscode.extensions.getExtension("sumneko.lua")) {
        const dismissedKey = "lua.installPromptDismissed";
        if (context.globalState.get<boolean>(dismissedKey)) return;

        const install = "Install Lua extension";
        const choice = await vscode.window.showInformationMessage(
            "Install the Lua extension to get autocomplete and validation for Enapter blueprint Lua files.",
            install,
            "Not now",
        );

        if (choice === install) {
            await vscode.commands.executeCommand("workbench.extensions.installExtension", "sumneko.lua");
        } else {
            await context.globalState.update(dismissedKey, true);
        }

        return;
    }

    // Detect which blueprint spec versions are used in this workspace.
    const versionDirs = await detectBlueprintVersionDirs();
    const ourBase = context.asAbsolutePath("resources/lua");
    const newPaths = versionDirs.map(d => context.asAbsolutePath(`resources/lua/${d}`));

    // Add versioned library paths so Lua LS loads the correct type definitions.
    const config = resource
        ? vscode.workspace.getConfiguration("Lua", resource)
        : vscode.workspace.getConfiguration("Lua");

    const rawLibrary: unknown = config.get("workspace.library");

    // workspace.library can be an array (older sumneko.lua) or an object map (newer versions).
    const existingLibs: string[] = Array.isArray(rawLibrary)
        ? rawLibrary
        : rawLibrary && typeof rawLibrary === "object"
            ? Object.keys(rawLibrary as Record<string, unknown>)
            : [];

    // Replace any existing paths under our base dir with the newly computed versioned set.
    const filtered = existingLibs.filter(p => !p.startsWith(ourBase));
    const combined = [...filtered, ...newPaths];

    const currentOurs = existingLibs.filter(p => p.startsWith(ourBase)).sort();
    const sortedNew = [...newPaths].sort();

    if (currentOurs.length === sortedNew.length && sortedNew.every((p, i) => currentOurs[i] === p)) {
        return;
    }

    try {
        await config.update("workspace.library", combined, target);
    } catch {
        return;
    }

    void vscode.commands.executeCommand("lua.reloadServer").then(undefined, () => void 0);
}