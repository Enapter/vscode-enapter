import { SitesConnectionsService } from "../services/sites-connections-service";
import { SiteType } from "../models/sites/site";
import { SitesAskForGatewayAddress } from "../tasks/sites-ask-for-gateway-address";
import vscode from "vscode";
import { Logger } from "../logger";

export const sitesEditAddress = async (site_id: string, service: SitesConnectionsService) => {
  try {
    const sites = service.getAll();
    const site = sites.find((site) => site.id === site_id);
    await service.disconnectById(site_id);

    if (!site || site.type === SiteType.Cloud) {
      return;
    }

    const address = await SitesAskForGatewayAddress.run();

    if (address === "") {
      return;
    }

    await service.updateAll(
      sites.map((s) => {
        if (s.id !== site_id) {
          return s;
        }

        return {
          ...s,
          address: address,
        };
      }),
    );
  } catch (e) {
    if (e instanceof vscode.CancellationError) {
      return;
    }

    Logger.log(e);
  }
};
