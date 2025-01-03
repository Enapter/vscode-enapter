export const CommandIDs = {
  Setup: {
    SetEnapterCloudConnectionType: "enapter.commands.Setup.SetEnapterCloudConnectionType",
    SetEnapterGatewayConnectionType: "enapter.commands.Setup.SetEnapterGatewayConnectionType",
    SetApiHost: "enapter.commands.Setup.SetApiHost",
    SetApiKey: "enapter.commands.Setup.SetApiKey",
  },
  Blueprints: {
    SelectDeviceAndUploadBlueprint: "enapter.commands.Blueprints.SelectDeviceAndUploadBlueprint",
    UploadToActiveDevice: "enapter.commands.Blueprints.UploadToActiveDevice",
  },
  Devices: {
    RefreshRecent: "enapter.commands.Devices.RefreshRecent",
    RemoveRecentByTreeNode: "enapter.commands.Devices.RemoveRecentByTreeNode",
    SelectRecentAsActiveByTreeNode: "enapter.commands.Devices.SelectRecentAsActiveByTreeNode",
    SelectActive: "enapter.commands.Devices.SelectActive",
    ResetActive: "enapter.commands.Devices.ResetActive",
    ReloadActive: "enapter.commands.Devices.ReloadActive",
  },
} as const;

type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? ValueOf<{ [K in keyof T]: DeepValueOf<T[K]> }> : T;

export type CommandID = DeepValueOf<typeof CommandIDs>;
