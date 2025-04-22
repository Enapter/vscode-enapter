import wretch, { Middleware } from "wretch";
import AbortAddon from "wretch/addons/abort";
import { loggable, Logger } from "../logger";
import { ExtSettings } from "../ext-settings";
import { Device, isSupportBlueprints, sortByOnlineStatus } from "../models/device";
import { CancellationError, CancellationToken } from "vscode";
import { CloudSite } from "../models/sites/cloud-site";
import { Site, SiteType } from "../models/sites/site";
import { ExtState } from "../ext-state";

const logMiddleware: Middleware = () => (next) => (url, opts) => {
  const logger = Logger.getInstance();
  logger.log(opts.method, url);
  logger.log("Headers:", opts.headers);
  logger.log("Body:", opts.body);
  return next(url, opts);
};

type AllLuaDevicesResponse = {
  devices: Array<Device>;
};

type UploadBlueprintResponse = { blueprint: { id: string } };

export type SiteResponse = {
  id: string;
  name: string;
};

export type AllSitesResponse = {
  sites: SiteResponse[];
};

export class ApiClient {
  private logger = Logger.getInstance();

  constructor(
    public readonly host: string,
    public readonly token: string,
  ) {}

  static async forSite(site: Site): Promise<ApiClient | undefined> {
    const extState = ExtState.getInstance();

    if (site.type === SiteType.Cloud) {
      const token = await extState.getCloudApiToken();
      return token ? ApiClient.forCloud(token) : undefined;
    }

    if (site.type === SiteType.Gateway) {
      const token = await extState.getGatewayApiToken(site);
      return token ? ApiClient.forGateway(site.address, token) : undefined;
    }

    return undefined;
  }

  static forCloud(token: string): ApiClient {
    return new ApiClient(CloudSite.ADDRESS, token);
  }

  static forGateway(host: string, token: string): ApiClient {
    return new ApiClient(host, token);
  }

  async getSiteDevices(site: Site) {
    return this.client
      .url(`/v3/sites/${site.id}/devices`)
      .get()
      .json<AllLuaDevicesResponse>()
      .then((res) => {
        return res.devices.filter(isSupportBlueprints).sort(sortByOnlineStatus);
      });
  }

  @loggable()
  async getAllSites(name?: string, controller?: AbortController) {
    const abortController = controller || new AbortController();
    return this.client.url(`/v3/sites?name=${name}`).signal(abortController).get().json<AllSitesResponse>();
  }

  @loggable()
  async getGatewaySiteInfo() {
    return this.client.url("/v3/site").get().json<{ site: SiteResponse }>();
  }

  @loggable()
  async getDevicesSupportBlueprints() {
    return this.client
      .url("/v3/devices?expand=properties,connectivity")
      .get()
      .json<AllLuaDevicesResponse>()
      .then((res) => {
        return res.devices.filter(isSupportBlueprints).sort(sortByOnlineStatus);
      });
  }

  @loggable()
  async getDeviceById(id: string) {
    return this.client.url(`/v3/devices/${id}`).get().json<{ device: Device }>();
  }

  @loggable()
  async uploadBlueprint(body: Uint8Array, token?: CancellationToken): Promise<{ blueprint: { id: string } }> {
    if (token?.isCancellationRequested) {
      throw new CancellationError();
    }

    return this.client
      .url("/v3/blueprints/upload")
      .body(body)
      .headers({
        "Content-Type": "application/zip",
      })
      .post()
      .json<UploadBlueprintResponse>();
  }

  @loggable()
  async assignBlueprintToDevice(blueprintId: string, deviceId: string, token?: CancellationToken) {
    if (token?.isCancellationRequested) {
      throw new CancellationError();
    }

    return this.client
      .url(`/v3/devices/${deviceId}/assign_blueprint`)
      .json({ blueprint_id: blueprintId })
      .headers({
        "Content-Type": "application/json",
      })
      .post()
      .json();
  }

  async getDeviceConnectivityStatus(deviceId: string) {
    return this.client.url(`/v3/devices/${deviceId}/connectivity_status`).get().json<{ status: string }>();
  }

  @loggable()
  checkConnection() {
    return this.client.url("/v3/devices").get();
  }

  get isConfigured(): boolean {
    return !!this.host && !!this.token;
  }

  private get client() {
    return wretch(this.host)
      .headers({
        "X-Enapter-Auth-Token": this.token,
      })
      .addon(AbortAddon())
      .middlewares([logMiddleware()])
      .errorType("json");
  }

  private get extensionSettings() {
    return ExtSettings.getInstance();
  }
}
