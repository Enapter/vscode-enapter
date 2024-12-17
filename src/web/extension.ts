import * as vscode from "vscode";
import { uploadBlueprint } from "./commands/upload-blueprint";
import { RecentDevicesProvider } from "./recent-devices-provider";
import { commandIDs } from "./constants/commands";
import { viewIDs } from "./constants/views";
import { Logger } from "./logger";
import { ExtContext } from "./ext-context";

export function activate(context: vscode.ExtensionContext) {
  const extContext = new ExtContext(context);

  const logger = Logger.getInstance();
  logger.addLogger(console);

  vscode.commands.registerCommand(commandIDs.uploadBlueprint, uploadBlueprint);

  context.subscriptions.push(
    vscode.window.createTreeView(viewIDs.devicesRecent, {
      treeDataProvider: new RecentDevicesProvider(context),
    }),
  );
}

export function deactivate() {}
