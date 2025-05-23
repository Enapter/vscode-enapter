import { SitesConnectionsStorage } from "../storages/sites-connections-storage";
import { Site } from "../models/sites/site";
import vscode from "vscode";

export class SitesConnectionsService {
  private readonly _onDidChangeSites = new vscode.EventEmitter<Site[]>();
  readonly onDidChangeSites = this._onDidChangeSites.event;

  private readonly _onDidChangeActiveSite = new vscode.EventEmitter<Site | undefined>();
  readonly onDidChangeActiveSite = this._onDidChangeActiveSite.event;

  constructor(private readonly storage: SitesConnectionsStorage) {
    this.setActiveSiteContext(!!this.getActive());
  }

  getAll() {
    return this.storage.getAll();
  }

  getById(id: string) {
    const all = this.getAll();
    return all.find((s) => s.id === id);
  }

  getActive() {
    const all = this.getAll();
    return all.find((s) => s.isActive);
  }

  async updateAll(sites: Site[]) {
    return this.storage.updateAll(sites).then(() => {
      this._onDidChangeSites.fire(sites);
    });
  }

  async add(site: Site) {
    const all = this.getAll();
    return this.updateAll([...all, site]);
  }

  async connectById(id: string) {
    const storedSites = this.getAll();

    if (!storedSites?.length) {
      return;
    }

    const site = storedSites.find((s) => s.id === id);

    if (!site || site.isActive) {
      return;
    }

    const sites = storedSites.map((s) => {
      s.isActive = s.id === id;
      return s;
    });

    await this.updateAll(sites);
    this.setActiveSiteContext(true);
    this._onDidChangeActiveSite.fire(site);
  }

  async removeById(id: string) {
    const storedSites = this.getAll();

    if (!storedSites?.length) {
      return;
    }

    const sites = storedSites.filter((s) => s.id !== id);

    await this.updateAll(sites);
    this.setActiveSiteContext(!!this.getActive());
    this._onDidChangeActiveSite.fire(undefined);
  }

  async disconnectById(id: string) {
    const storedSites = this.getAll();

    if (!storedSites?.length) {
      return;
    }

    const site = storedSites.find((s) => s.id === id);

    if (!site || !site.isActive) {
      return;
    }

    const sites = storedSites.map((s) => {
      s.isActive = false;
      return s;
    });

    await this.updateAll(sites);
    this.setActiveSiteContext(false);
    this._onDidChangeActiveSite.fire(undefined);
  }

  private setActiveSiteContext(isPresent: boolean) {
    vscode.commands.executeCommand("setContext", "enapter.context.Sites.IsActivePresent", isPresent);
  }
}
