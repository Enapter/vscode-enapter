import vscode from "vscode";
import { Site } from "../models/sites/site";

export class SitesConnectionsStorage {
  static STORAGE_KEY = "Enapter.Storage.Sites.Connections";

  constructor(private readonly storage: vscode.Memento) {}

  getAll() {
    return this.storage.get<Site[]>(this.key, []);
  }

  async updateAll(sites: Site[]) {
    return this.storage.update(this.key, sites);
  }

  private get key() {
    return SitesConnectionsStorage.STORAGE_KEY;
  }
}
