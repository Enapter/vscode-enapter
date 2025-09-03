import vscode from "vscode";
import { suiteSetup } from "mocha";
import { assert } from "chai";

suiteSetup(async function () {
  await vscode.commands.executeCommand("enapter.commands.Channels.DeviceLogs.Reveal");
  assert(vscode.extensions.getExtension("undefined_publisher.enapter")?.isActive, "Enapter extension is not active");
});
