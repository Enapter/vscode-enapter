import vscode from "vscode";
import { Site, SiteType } from "./site";
import { SiteFactory } from "./site-factory";

export class SiteRepository {
  private readonly secretsStorage: vscode.SecretStorage;
  private static SITES_STORAGE_KEY = "sites";
  private static CLOUD_API_TOKEN_STORAGE_KEY = "enapter.secrets.cloudApiToken";
  private static GATEWAY_API_TOKEN_STORAGE_KEY = "enapter.secrets.gatewaysApiTokens";

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly storage: vscode.Memento,
  ) {
    this.secretsStorage = this.context.secrets;
  }

  async storeCloudApiToken(apiToken: string) {
    return this.secretsStorage.store(SiteRepository.CLOUD_API_TOKEN_STORAGE_KEY, apiToken);
  }

  async deleteCloudApiToken() {
    return this.secretsStorage.delete(SiteRepository.CLOUD_API_TOKEN_STORAGE_KEY);
  }

  async getCloudApiToken() {
    return this.secretsStorage.get(SiteRepository.CLOUD_API_TOKEN_STORAGE_KEY);
  }

  async storeGatewayApiToken(site: Site, apiToken: string) {
    return this.secretsStorage.store(this.getGatewayApiStorageKey(site), apiToken);
  }

  async deleteGatewayApiToken(site: Site) {
    return this.secretsStorage.delete(this.getGatewayApiStorageKey(site));
  }

  async getGatewayApiToken(site: Site) {
    return this.secretsStorage.get(this.getGatewayApiStorageKey(site));
  }

  async isCloudApiTokenSet() {
    const token = await this.getCloudApiToken();
    return !!token;
  }

  getAll(): Site[] {
    const serialized = this.storage.get(SiteRepository.SITES_STORAGE_KEY, []);
    return serialized
      .map((site) => SiteFactory.deserialize(site))
      .filter((site): site is Site => site !== undefined)
      .sort(this.sortSitesCloudFirst);
  }

  getById(id: string): Site | undefined {
    return this.getAll().find((site) => site.id === id);
  }

  getActive(): Site | undefined {
    return this.getAll().find((site) => site.isActive);
  }

  async add(site: Site): Promise<void> {
    const sites = this.getAll();
    const serialized = [...sites.map((s) => s.serialize()), site.serialize()];
    await this.storage.update(SiteRepository.SITES_STORAGE_KEY, serialized);
  }

  async remove(id: string): Promise<void> {
    const sites = this.getAll().filter((site) => site.id !== id);
    const serialized = sites.map((s) => s.serialize());
    await this.storage.update(SiteRepository.SITES_STORAGE_KEY, serialized);
  }

  async removeAll() {
    await this.storage.update(SiteRepository.SITES_STORAGE_KEY, undefined);
  }

  private sortSitesCloudFirst(a: Site, b: Site): number {
    if (a.type === SiteType.Cloud && b.type !== SiteType.Cloud) {
      return -1;
    }

    if (a.type !== SiteType.Cloud && b.type === SiteType.Cloud) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  }

  private getGatewayApiStorageKey(site: Site) {
    if (site.type !== SiteType.Gateway) {
      throw new Error("Site is not a gateway");
    }

    return `${SiteRepository.GATEWAY_API_TOKEN_STORAGE_KEY}.${site.id}`;
  }
}
