export const CommandIDs = {
  Blueprints: {
    UploadToActiveDevice: "enapter.commands.Blueprints.UploadToActiveDevice",
    UploadActiveEditorManifest: "enapter.commands.Blueprints.UploadActiveEditorManifest",
  },
  Devices: {
    Connect: "enapter.commands.Devices.Connect",
    Disconnect: "enapter.commands.Devices.Disconnect",
    ReloadActive: "enapter.commands.Devices.ReloadActive",
    UploadBlueprint: "enapter.commands.Devices.UploadBlueprint",
    StreamLogs: "enapter.commands.Devices.StreamLogs",
    StopLogs: "enapter.commands.Devices.StopLogs",
    Active: {
      Disconnect: "enapter.commands.Devices.Active.Disconnect",
    },
  },
  Sites: {
    ConnectToNew: "enapter.commands.Sites.ConnectToNew",
    ConnectToCloudSite: "enapter.commands.Sites.ConnectToCloudSite",
    ConnectToGatewaySite: "enapter.commands.Sites.ConnectToGatewaySite",
    Connect: "enapter.commands.Sites.Connect",
    Disconnect: "enapter.commands.Sites.Disconnect",
    Remove: "enapter.commands.Sites.Remove",
    RemoveAll: "enapter.commands.Sites.RemoveAll",
    RemoveCloudApiToken: "enapter.commands.Sites.RemoveCloudApiToken",
    SetCloudApiToken: "enapter.commands.Sites.SetCloudApiToken",
    CopyApiToken: "enapter.commands.Sites.CopyApiToken",
    EditAddress: "enapter.commands.Sites.EditAddress",
    ReloadDevices: "enapter.commands.Sites.ReloadDevices",
  },
  Enbp: {
    Mount: "enapter.commands.Enbp.Mount",
    OpenTreeItem: "enapter.commands.Enbp.OpenTreeItem",
  },
  Common: {
    CopyProperty: "enapter.commands.Common.CopyProperty",
  },
  Channels: {
    DeviceLogs: {
      Reveal: "enapter.commands.Channels.DeviceLogs.Reveal",
    },
  },
} as const;

type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? ValueOf<{ [K in keyof T]: DeepValueOf<T[K]> }> : T;

export type CommandID = DeepValueOf<typeof CommandIDs>;
