import wretch, { Middleware } from "wretch";
import { loggable, Logger } from "../logger";
import { ExtSettings } from "../ext-settings";
import { Device, isSupportBlueprints } from "../models/device";

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

export class ApiClient {
  private host: string;
  private token: string;

  constructor(private readonly logger = Logger.getInstance()) {
    this.host = this.extensionSettings.apiHost;
    this.token = this.extensionSettings.apiKey;
  }

  @loggable()
  async getDevicesSupportBlueprints() {
    return this.client
      .url("/v3/devices?expand=properties")
      .get()
      .json<AllLuaDevicesResponse>()
      .then((res) => {
        return res.devices.filter(isSupportBlueprints);
      });
  }

  @loggable()
  async getDeviceById(id: string) {
    return this.client.url(`/v3/devices/${id}`).get().json<{ device: Device }>();
  }

  @loggable()
  async uploadBlueprint(body: Uint8Array): Promise<{ blueprint: { id: string } }> {
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
  async assignBlueprintToDevice(blueprintId: string, deviceId: string) {
    return this.client
      .url(`/v3/devices/${deviceId}/assign_blueprint`)
      .json({ blueprint_id: blueprintId })
      .headers({
        "Content-Type": "application/json",
      })
      .post()
      .json();
  }

  private get client() {
    return wretch(this.host)
      .headers({
        "X-Enapter-Auth-Token": this.token,
      })
      .middlewares([logMiddleware()])
      .errorType("json");
  }

  private get extensionSettings() {
    return new ExtSettings();
  }
}
