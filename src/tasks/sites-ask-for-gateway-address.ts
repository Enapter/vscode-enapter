import vscode from "vscode";
import { z } from "zod";
import { withApiPathSegment } from "../models/sites/gateway-site";

const addressValidator = z.string().url().or(z.string().ip());

const validateInput = (value: string) => {
  const result = addressValidator.safeParse(value);

  if (result.error) {
    return "Invalid address. Please enter a valid URL or IP address.";
  }

  return null;
};

export class SitesAskForGatewayAddress {
  constructor(private readonly address: string = "") {}

  static async run(address?: string, token?: vscode.CancellationToken | undefined) {
    if (token?.isCancellationRequested) {
      throw new vscode.CancellationError();
    }

    return new SitesAskForGatewayAddress(address).run();
  }

  async run() {
    const address = await vscode.window.showInputBox({
      prompt: "Enter the address of your gateway",
      value: this.address,
      placeHolder: "http://my-gateway.local",
      ignoreFocusOut: true,
      validateInput,
    });

    if (!address) {
      throw new vscode.CancellationError();
    }

    return withApiPathSegment(address);
  }
}
