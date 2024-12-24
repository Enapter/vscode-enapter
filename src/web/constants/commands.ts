export const CommandIDs = {
  Blueprints: {
    SelectDeviceAndUploadBlueprint: "enapter-blueprints.commands.Blueprints.SelectDeviceAndUploadBlueprint",
    UploadToActiveDevice: "enapter-blueprints.commands.Blueprints.UploadToActiveDevice",
  },
  Devices: {
    RefreshRecent: "enapter-blueprints.commands.Devices.RefreshRecent",
    RemoveRecentByTreeNode: "enapter-blueprints.commands.Devices.RemoveRecentByTreeNode",
    SelectRecentAsActiveByTreeNode: "enapter-blueprints.commands.Devices.SelectRecentAsActiveByTreeNode",
    SelectActive: "enapter-blueprints.commands.Devices.SelectActive",
    ResetActive: "enapter-blueprints.commands.Devices.ResetActive",
    ReloadActive: "enapter-blueprints.commands.Devices.ReloadActive",
  },
} as const;
