import wretch, { Middleware } from "wretch";
import AbortAddon from "wretch/addons/abort";
import { loggable, Logger } from "../logger";
import { Device, isSupportBlueprints, sortByOnlineStatus } from "../models/device";
import { CancellationError, CancellationToken } from "vscode";
import { CloudSite } from "../models/sites/cloud-site";
import { Site, SiteType } from "../models/sites/site";
import { ExtState } from "../ext-state";
import { Agent, fetch as undiciFetch } from "undici";

const logMiddleware: Middleware = () => (next) => (url, opts) => {
  const logger = Logger.getInstance();
  logger.log(opts.method, url);
  return next(url, opts);
};

export type AllLuaDevicesResponse = {
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

export class TokenNotFoundError extends Error {
  constructor() {
    super("Token not found");
    this.name = "TokenNotFoundError";
  }
}

export class InvalidSiteTypeError extends Error {
  constructor() {
    super("Invalid site type");
    this.name = "InvalidSiteTypeError";
  }
}

export class ApiClient {
  private logger = Logger.getInstance();

  constructor(
    public readonly host: string,
    public readonly token: string,
  ) {}

  static async forSite(site: Site): Promise<ApiClient> {
    const extState = ExtState.getInstance();

    if (site.type === SiteType.Cloud) {
      const token = await extState.getCloudApiToken();

      if (!token) {
        throw new TokenNotFoundError();
      }

      return ApiClient.forCloud(token);
    }

    if (site.type === SiteType.Gateway) {
      const token = await extState.getGatewayApiToken(site);

      if (!token) {
        throw new TokenNotFoundError();
      }

      return ApiClient.forGateway(site.address, token);
    }

    throw new InvalidSiteTypeError();
  }

  static forCloud(token: string): ApiClient {
    return new ApiClient(CloudSite.ADDRESS, token);
  }

  static forGateway(host: string, token: string): ApiClient {
    return new ApiClient(host, token);
  }

  getSiteDevices(site: Site) {
    return this.client.url(`/v3/sites/${site.id}/devices?expand=connectivity`).get();
  }

  @loggable()
  async getAllSites(name?: string, controller?: AbortController) {
    const abortController = controller || new AbortController();
    return this.client.url(`/v3/sites?name=${name}`).signal(abortController).get().json<AllSitesResponse>();
  }

  getSiteInfo(site: Site) {
    return this.client.url(`/v3/sites/${site.id}`).get();
  }

  @loggable()
  getGatewaySiteInfo() {
    return this.client.url("/v3/site").get();
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
  async getDeviceById(_siteId: string, id: string) {
    return this.client.url(`/v3/devices/${id}?expand=connectivity`).get().json<{ device: Device }>();
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

  @loggable()
  checkConnection() {
    return this.client.url("/v3/devices").get();
  }

  private get client() {
    return wretch(this.host)
      .polyfills({ fetch: undiciFetch })
      .options({
        dispatcher: new Agent({
          connect: {
            rejectUnauthorized: false,
          },
        }),
      })
      .headers({
        "X-Enapter-Auth-Token": this.token,
      })
      .addon(AbortAddon())
      .middlewares([logMiddleware()]);
  }
}
