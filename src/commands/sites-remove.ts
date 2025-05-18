import { CloudSiteNode } from "../providers/sites-connections/nodes/cloud-site-node";
import { GatewayNode } from "../providers/sites-connections/nodes/gateway-node";
import { SitesConnectionsService } from "../services/sites-connections-service";

export const sitesRemove = async (node: CloudSiteNode | GatewayNode, service: SitesConnectionsService) => {
  return service.removeById(node.site.id);
};
