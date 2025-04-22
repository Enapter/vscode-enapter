import { BaseSite, SiteType } from "./site";

export class GatewaySite extends BaseSite {
  public readonly type = SiteType.Gateway;

  constructor(
    public id: string,
    public name: string,
    public address: string,
    public isActive: boolean = false,
  ) {
    super(id, name, address, isActive, SiteType.Gateway);
  }

  static deserialize(serialized: string): GatewaySite {
    const { id, name, address, isActive } = JSON.parse(serialized);
    return new GatewaySite(id, name, address, isActive);
  }

  withIsActive(isActive: boolean): GatewaySite {
    return new GatewaySite(this.id, this.name, this.address, isActive);
  }
}
