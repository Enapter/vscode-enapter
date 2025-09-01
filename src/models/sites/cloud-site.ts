import { BaseSite, SiteType } from "./site";

export class CloudSite extends BaseSite {
  public static ADDRESS = "http://localhost:6942";
  public readonly type = SiteType.Cloud;
  public readonly address = CloudSite.ADDRESS;

  constructor(
    public id: string,
    public name: string,
    public isActive: boolean = true,
  ) {
    super(id, name, CloudSite.ADDRESS, isActive, SiteType.Cloud);
  }

  static deserialize(serialized: string): CloudSite {
    const { id, name, isActive } = JSON.parse(serialized);
    return new CloudSite(id, name, isActive);
  }

  withIsActive(isActive: boolean): CloudSite {
    return new CloudSite(this.id, this.name, isActive);
  }
}
