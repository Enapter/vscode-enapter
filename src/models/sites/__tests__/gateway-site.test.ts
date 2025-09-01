import { describe, it } from "mocha";
import { GatewaySite, withApiPathSegment } from "../gateway-site";
import { expect } from "chai";
import { Site, SiteType } from "../site";

const address = "http://example.com";

describe("GatewaySite", () => {
  it("should construct new GatewaySite", () => {
    expect(new GatewaySite("1", "Test Site", address)).to.exist;
  });

  it("should have correct type", () => {
    const site = new GatewaySite("1", "Test Site", address);
    expect(site.type).to.equal(SiteType.Gateway);
  });

  it("should construct valid Site interface", () => {
    const gatewaySite = new GatewaySite("1", "Test Site", address);

    const basicSite: Site = {
      id: "1",
      name: "Test Site",
      address,
      type: SiteType.Gateway,
      isActive: gatewaySite.isActive,
      withIsActive: gatewaySite.withIsActive,
      serialize: gatewaySite.serialize,
    };

    expect(gatewaySite.id).to.equal(basicSite.id);
    expect(gatewaySite.name).to.equal(basicSite.name);
    expect(gatewaySite.address).to.equal(basicSite.address);
    expect(gatewaySite.type).to.equal(basicSite.type);
  });

  it("should be deserialized", () => {
    const site = new GatewaySite("1", "Test Site", address);
    expect(GatewaySite.deserialize(site.serialize())).to.deep.equal(site);
  });

  it("should return new active site", () => {
    const site = new GatewaySite("1", "Test Site", address, false);
    expect(site.isActive).to.be.false;
    const newSite = site.withIsActive(true);
    expect(newSite.isActive).to.be.true;
    expect(newSite.id).to.equal(site.id);
    expect(newSite.name).to.equal(site.name);
    expect(newSite.address).to.equal(site.address);
    expect(newSite.type).to.equal(site.type);
  });

  describe("withApiPathSegment", () => {
    const cases = [
      { input: "http://example.com", expected: "http://example.com/api" },
      { input: "http://example.com/", expected: "http://example.com/api" },
      { input: "http://example.com/api", expected: "http://example.com/api" },
      { input: "https://stagings.enapter.com", expected: "https://stagings.enapter.com" },
      { input: "https://stagings.enapter.com/", expected: "https://stagings.enapter.com/" },
      { input: "https://stagings.enapter.com/api", expected: "https://stagings.enapter.com/api" },
    ];

    cases.forEach(({ input, expected }) => {
      it(`should convert "${input}" to "${expected}"`, () => {
        expect(withApiPathSegment(input)).to.equal(expected);
      });
    });
  });
});
