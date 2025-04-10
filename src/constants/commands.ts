export const CommandIDs = {
  Setup: {
    SetEnapterCloudConnectionType: "enapter.commands.Setup.SetEnapterCloudConnectionType",
    SetEnapterGatewayConnectionType: "enapter.commands.Setup.SetEnapterGatewayConnectionType",
    SetApiHost: "enapter.commands.Setup.SetApiHost",
    SetApiKey: "enapter.commands.Setup.SetApiKey",
    CheckConnection: "enapter.commands.Setup.CheckConnection",
  },
  Blueprints: {
    SelectDeviceAndUploadBlueprint: "enapter.commands.Blueprints.SelectDeviceAndUploadBlueprint",
    UploadToActiveDevice: "enapter.commands.Blueprints.UploadToActiveDevice",
    UploadActiveEditorManifest: "enapter.commands.Blueprints.UploadActiveEditorManifest",
  },
  Devices: {
    RefreshRecent: "enapter.commands.Devices.RefreshRecent",
    RemoveRecentByTreeNode: "enapter.commands.Devices.RemoveRecentByTreeNode",
    SelectRecentAsActiveByTreeNode: "enapter.commands.Devices.SelectRecentAsActiveByTreeNode",
    SelectActive: "enapter.commands.Devices.SelectActive",
    ResetActive: "enapter.commands.Devices.ResetActive",
    ReloadActive: "enapter.commands.Devices.ReloadActive",
    CopyProperty: "enapter.commands.Devices.CopyProperty",
    UploadBlueprintToDevice: "enapter.commands.Devices.UploadBlueprintToDevice",
  },
  Enbp: {
    Mount: "enapter.commands.Enbp.Mount",
    OpenTreeItem: "enapter.commands.Enbp.OpenTreeItem",
  },
} as const;

type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? ValueOf<{ [K in keyof T]: DeepValueOf<T[K]> }> : T;

export type CommandID = DeepValueOf<typeof CommandIDs>;
