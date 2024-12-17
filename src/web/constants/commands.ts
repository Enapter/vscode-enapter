import type { ViewContainer } from "./views";

type CommandsKey = "commands";
type ShortCommandID = "uploadBlueprint" | "devicesRecentRefresh";
type CommandID = `${ViewContainer}.${CommandsKey}.${ShortCommandID}`;

export const commandIDs: Record<ShortCommandID, CommandID> = {
  uploadBlueprint: "enapter-blueprints.commands.uploadBlueprint",
  devicesRecentRefresh: "enapter-blueprints.commands.devicesRecentRefresh",
};
