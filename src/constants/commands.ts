export const CommandIDs = {
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
