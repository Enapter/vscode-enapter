import { afterEach, beforeEach, describe, it } from "mocha";
import vscode from "vscode";
import { SiteRepository } from "../sites-repository";
import { expect } from "chai";
import { nanoid } from "nanoid";
import { Site, SiteType } from "../site";
import { CloudSite } from "../cloud-site";
import { GatewaySite } from "../gateway-site";

const ensureContext = (context: any) => {
  if (!context) {
    throw new Error("Extension context is not available");
  }

  if (!context.extensionPath) {
    throw new Error(`${JSON.stringify(context)} Extension context is missing 'extensionPath'`);
  }

  return context as vscode.ExtensionContext;
};

describe("SitesRepository", async () => {
  let repo: SiteRepository = {} as SiteRepository;

  beforeEach(function (done: any) {
    vscode.extensions
      .getExtension("undefined_publisher.enapter")
      ?.activate()
      .then((config) => {
        try {
          const context = ensureContext(config.context);
          repo = new SiteRepository(context, context.globalState);
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  afterEach(() => {
    repo = {} as SiteRepository;
  });

  it("should initialize SitesRepository", () => {
    expect(repo).to.exist.and.not.be.empty;
  });

  describe("Enapter Cloud API token", () => {
    beforeEach(async () => {
      await repo.deleteCloudApiToken();
    });

    describe("#storeCloudApiToken", () => {
      it("should store token if it's empty", async () => {
        const token = nanoid();
        await repo.storeCloudApiToken(token);
        expect(await repo.getCloudApiToken()).to.be.equal(token);
      });

      it("should rewrite token", async () => {
        await repo.storeCloudApiToken(nanoid());
        expect(await repo.getCloudApiToken()).to.not.be.empty;
        const token = nanoid();
        await repo.storeCloudApiToken(token);
        expect(await repo.getCloudApiToken()).to.be.equal(token);
      });
    });

    describe("#deleteCloudApiToken", () => {
      it("should delete token", async () => {
        await repo.storeCloudApiToken(nanoid());
        expect(await repo.getCloudApiToken()).to.not.be.undefined;
        await expect(repo.deleteCloudApiToken()).to.eventually.be.fulfilled;
        expect(await repo.getCloudApiToken()).to.be.undefined;
      });

      it("should not throw if token is not stored", async () => {
        expect(await repo.getCloudApiToken()).to.be.undefined;
        await expect(repo.deleteCloudApiToken()).to.eventually.be.fulfilled;
        expect(await repo.getCloudApiToken()).to.be.undefined;
      });
    });

    describe("#getCloudApiToken", () => {
      it("should return valid token", async () => {
        const token = nanoid();
        await repo.storeCloudApiToken(token);
        expect(await repo.getCloudApiToken()).to.be.equal(token);
      });

      it("should return undefined if no token stored", async () => {
        expect(await repo.getCloudApiToken()).to.be.undefined;
      });
    });

    describe("#isCloudApiTokenSet", () => {
      it("should return true if token is stored", async () => {
        const token = nanoid();
        await repo.storeCloudApiToken(token);
        expect(await repo.isCloudApiTokenSet()).to.be.true;
      });

      it("should return false if no token stored", async () => {
        expect(await repo.isCloudApiTokenSet()).to.be.false;
      });
    });
  });

  describe("Enapter Gateway API token", () => {
    const site: Site = {
      id: nanoid(),
      name: nanoid(),
      address: nanoid(),
      type: SiteType.Gateway,
      isActive: true,
      withIsActive: () => ({}) as Site,
      serialize: () => "",
    };

    beforeEach(async () => {
      await repo.deleteGatewayApiToken(site);
    });

    describe("#storeGatewayApiToken", () => {
      it("should store token if it's empty", async () => {
        const token = nanoid();
        await repo.storeGatewayApiToken(site, token);
        expect(await repo.getGatewayApiToken(site)).to.be.equal(token);
      });

      it("should rewrite token", async () => {
        await repo.storeGatewayApiToken(site, nanoid());
        expect(await repo.getGatewayApiToken(site)).to.not.be.empty;
        const token = nanoid();
        await repo.storeGatewayApiToken(site, token);
        expect(await repo.getGatewayApiToken(site)).to.be.equal(token);
      });

      it("should throw if site is not Gateway", async () => {
        const nonGatewaySite = { ...site, type: SiteType.Cloud };
        await expect(repo.storeGatewayApiToken(nonGatewaySite, nanoid())).to.eventually.be.rejectedWith(Error);
      });
    });

    describe("#getGatewayApiToken", () => {
      it("should return valid token", async () => {
        const token = nanoid();
        await repo.storeGatewayApiToken(site, token);
        expect(await repo.getGatewayApiToken(site)).to.be.equal(token);
      });

      it("should return undefined if no token stored", async () => {
        expect(await repo.getGatewayApiToken(site)).to.be.undefined;
      });

      it("should throw if site is not Gateway", async () => {
        const nonGatewaySite = { ...site, type: SiteType.Cloud };
        await expect(repo.getGatewayApiToken(nonGatewaySite)).to.eventually.be.rejectedWith(Error);
      });
    });
  });

  describe("sites retrieval", () => {
    const getSite = (isActive: boolean, type = SiteType.Cloud): Site => {
      if (type === SiteType.Cloud) {
        return new CloudSite(nanoid(), nanoid(), isActive);
      }

      return new GatewaySite(nanoid(), nanoid(), `http://${nanoid()}`, isActive);
    };

    beforeEach(async () => {
      console.log("Removing all sites before test");
      await repo.removeAll();
    });

    afterEach(async () => {
      console.log("Removing all sites after test");
      await repo.removeAll();
    });

    it("should return active site", async () => {
      const activeSite = getSite(true);
      await repo.add(getSite(false));
      await repo.add(activeSite);
      await repo.add(getSite(false));
      const site = repo.getActive();
      expect(site).to.deep.equal(activeSite);
    });

    it("should return undefined if no active site", () => {
      repo.add(getSite(false));
      repo.add(getSite(false));
      const site = repo.getActive();
      expect(site).to.be.undefined;
    });

    it("should return all stored sites", () => {
      const sites = [getSite(false), getSite(true), getSite(false)];
      sites.forEach((s) => repo.add(s));
      const storedSites = repo.getAll();
      expect(storedSites).to.have.lengthOf(sites.length);
      expect(storedSites).to.deep.include.members(sites);
    });

    it("should return site by id", () => {
      const sites = [getSite(false), getSite(true), getSite(false)];
      sites.forEach((s) => repo.add(s));
      const storedSite = repo.getById(sites[1].id);
      expect(storedSite).to.deep.equal(sites[1]);
    });

    it("should return Enapter Cloud sites first", async () => {
      await repo.add(getSite(false, SiteType.Gateway));
      await repo.add(getSite(false));
      await repo.add(getSite(false, SiteType.Gateway));
      await repo.add(getSite(false));
      await repo.add(getSite(false, SiteType.Gateway));
      await repo.add(getSite(false));
      await repo.add(getSite(false));
      await repo.add(getSite(false, SiteType.Gateway));
      await repo.add(getSite(false));
      await repo.add(getSite(false, SiteType.Gateway));
      const storedSites = repo.getAll();
      expect(storedSites[0].type).to.equal(SiteType.Cloud);
      expect(storedSites[1].type).to.equal(SiteType.Cloud);
      expect(storedSites[5].type).to.equal(SiteType.Gateway);
      expect(storedSites[6].type).to.equal(SiteType.Gateway);
    });
  });

  describe("sites removal", () => {
    const getSite = (isActive: boolean): Site => {
      return new CloudSite(nanoid(), nanoid(), isActive);
    };

    beforeEach(async () => {
      await repo.removeAll();
      await repo.add(getSite(false));
      await repo.add(getSite(true));
      await repo.add(getSite(false));
      expect(repo.getAll()).to.have.lengthOf(3);
    });

    afterEach(async () => {
      await repo.removeAll();
    });

    it("should remove site by id", async () => {
      const sitesBefore = repo.getAll();
      const siteToRemove = sitesBefore[1];
      await repo.remove(siteToRemove.id);
      const sitesAfter = repo.getAll();
      expect(sitesAfter).to.have.lengthOf(sitesBefore.length - 1);
      expect(sitesAfter).to.not.deep.include(siteToRemove);
    });

    it("should not mutate stored sites if provided id is not stored", async () => {
      const sitesBefore = repo.getAll();
      await repo.remove(nanoid());
      const sitesAfter = repo.getAll();
      expect(sitesAfter).to.have.lengthOf(sitesBefore.length);
      expect(sitesAfter).to.deep.include.members(sitesBefore);
    });
  });
});
