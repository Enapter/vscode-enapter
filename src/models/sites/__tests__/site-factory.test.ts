import { before, after, describe, it } from "mocha";
import { expect } from "chai";
import { SiteFactory } from "../site-factory";
import { SiteType } from "../site";
import sinon from "sinon";
import { Logger } from "../../../logger";

describe("SiteFactory", () => {
  before(() => {
    sinon.stub(Logger, "log").returns();
  });

  after(() => {
    sinon.restore();
  });

  it("should create CloudSite", () => {
    const site = SiteFactory.createCloudSite("1", "Test Site");
    expect(site).to.exist;
    expect(site.type).to.equal(SiteType.Cloud);
  });

  it("should create GatewaySite", () => {
    const site = SiteFactory.createGatewaySite("1", "Test Site", "http://example.com");
    expect(site).to.exist;
    expect(site.type).to.equal(SiteType.Gateway);
  });

  it("should deserialize CloudSite", () => {
    const originalSite = SiteFactory.createCloudSite("1", "Test Site");
    const serialized = originalSite.serialize();
    const deserializedSite = SiteFactory.deserialize(serialized);
    expect(deserializedSite).to.deep.equal(originalSite);
  });

  it("should deserialize GatewaySite", () => {
    const originalSite = SiteFactory.createGatewaySite("1", "Test Site", "http://example.com");
    const serialized = originalSite.serialize();
    const deserializedSite = SiteFactory.deserialize(serialized);
    expect(deserializedSite).to.deep.equal(originalSite);
  });

  it("should return undefined for invalid serialized data", () => {
    const deserializedSite = SiteFactory.deserialize("invalid json");
    expect(deserializedSite).to.be.undefined;
  });

  it("should return undefined for unknown site type", () => {
    const unknownTypeSerialized = JSON.stringify({ id: "1", name: "Test Site", type: "Unknown" });
    const deserializedSite = SiteFactory.deserialize(unknownTypeSerialized);
    expect(deserializedSite).to.be.undefined;
  });
});
