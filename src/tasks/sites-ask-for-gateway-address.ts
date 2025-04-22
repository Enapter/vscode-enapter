import vscode from "vscode";
import { z } from "zod";

const addressValidator = z.string().url().or(z.string().ip());

const validateInput = (value: string) => {
  const result = addressValidator.safeParse(value);

  if (result.error) {
    return "Invalid address. Please enter a valid URL or IP address.";
  }

  return null;
};

export class SitesAskForGatewayAddress {
  constructor() {}

  static async run(token?: vscode.CancellationToken | undefined) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesAskForGatewayAddress().run();
  }

  async run() {
    const name = await vscode.window.showInputBox({
      prompt: "Enter the address of your gateway",
      placeHolder: "http://my-gateway.local",
      ignoreFocusOut: true,
      validateInput,
    });

    if (!name) {
      throw new vscode.CancellationError();
    }

    return name;
  }
}
