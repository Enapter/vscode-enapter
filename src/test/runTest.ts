import * as path from "path";

import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");
    const testWorkspace = path.resolve(__dirname, "../../testing-workspaces/v3/default");

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [testWorkspace],
    });
  } catch {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
