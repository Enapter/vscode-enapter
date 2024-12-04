import * as vscode from 'vscode';
import { uploadBlueprint } from './commands/upload-blueprint';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "enapter-blueprints-ide" is now active in the web extension host!');

	const disposable = vscode.commands.registerCommand('enapter-blueprints-ide.uploadBlueprint', uploadBlueprint);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
