import vscode from 'vscode';
import { Logger } from './logger';

export class ProjectExplorer {
  constructor(private readonly logger = Logger.getInstance()) {
  }

  findAllManifests() {
    return this.ws.findFiles("**/manifest.yml");
  }

  private get ws() {
    return vscode.workspace;
  }
}
