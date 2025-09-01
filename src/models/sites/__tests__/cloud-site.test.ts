import { describe, it } from "mocha";
import { CloudSite } from "../cloud-site";
import { expect } from "chai";
import { Site, SiteType } from "../site";

describe("CloudSite", () => {
  it("should construct new CloudSite", () => {
    expect(new CloudSite("1", "Test Site")).to.exist;
  });

  it("should have correct type", () => {
    const site = new CloudSite("1", "Test Site");
    expect(site.type).to.equal(SiteType.Cloud);
  });

  it("should construct valid Site interface", () => {
    const cloudSite = new CloudSite("1", "Test Site");

    const basicSite: Site = {
      id: "1",
      name: "Test Site",
      address: CloudSite.ADDRESS,
      type: SiteType.Cloud,
      isActive: cloudSite.isActive,
      withIsActive: cloudSite.withIsActive,
      serialize: cloudSite.serialize,
    };

    expect(cloudSite.id).to.equal(basicSite.id);
    expect(cloudSite.name).to.equal(basicSite.name);
    expect(cloudSite.address).to.equal(basicSite.address);
    expect(cloudSite.type).to.equal(basicSite.type);
  });

  it("should be deserialized", () => {
    const site = new CloudSite("1", "Test Site");
    expect(CloudSite.deserialize(site.serialize())).to.deep.equal(site);
  });

  it("should return new active site", () => {
    const site = new CloudSite("1", "Test Site", false);
    expect(site.isActive).to.be.false;
    const newSite = site.withIsActive(true);
    expect(newSite.isActive).to.be.true;
    expect(newSite.id).to.equal(site.id);
    expect(newSite.name).to.equal(site.name);
    expect(newSite.address).to.equal(site.address);
    expect(newSite.type).to.equal(site.type);
  });
});
