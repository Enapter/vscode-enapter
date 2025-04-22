export const CommandIDs = {
  Blueprints: {
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
    UploadBlueprint: "enapter.commands.Devices.UploadBlueprint",
  },
  Sites: {
    ConnectToNew: "enapter.commands.Sites.ConnectToNew",
    ConnectToCloudSite: "enapter.commands.Sites.ConnectToCloudSite",
    ConnectToGatewaySite: "enapter.commands.Sites.ConnectToGatewaySite",
    Connect: "enapter.commands.Sites.Connect",
    Disconnect: "enapter.commands.Sites.Disconnect",
    DisconnectAll: "enapter.commands.Sites.DisconnectAll",
    RemoveCloudApiToken: "enapter.commands.Sites.RemoveCloudApiToken",
    SetCloudApiToken: "enapter.commands.Sites.SetCloudApiToken",
    CopyApiToken: "enapter.commands.Sites.CopyApiToken",
  },
  Enbp: {
    Mount: "enapter.commands.Enbp.Mount",
    OpenTreeItem: "enapter.commands.Enbp.OpenTreeItem",
  },
} as const;

type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? ValueOf<{ [K in keyof T]: DeepValueOf<T[K]> }> : T;

export type CommandID = DeepValueOf<typeof CommandIDs>;
