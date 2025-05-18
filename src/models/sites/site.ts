export enum SiteType {
  Cloud = "cloud",
  Gateway = "gateway",
}

export interface Site {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly type: SiteType;
  isActive: boolean;

  withIsActive: (isActive: boolean) => Site;
  serialize: () => string;
}

export abstract class BaseSite implements Site {
  protected constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly isActive: boolean,
    public readonly type: SiteType,
  ) {}

  abstract withIsActive(isActive: boolean): BaseSite;

  serialize(): string {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      name: this.name,
      address: this.address,
      isActive: this.isActive,
    });
  }
}
