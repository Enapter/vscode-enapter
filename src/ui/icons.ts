import vscode from "vscode";
import { GreenColor, OfflineIndicatorColor } from "./colors";
import { Device, isDeviceOnline } from "../models/device";

export class OnlineIcon extends vscode.ThemeIcon {
  constructor() {
    super("circle-filled", new GreenColor());
  }
}

export class OfflineIcon extends vscode.ThemeIcon {
  constructor() {
    super("circle-filled", new OfflineIndicatorColor());
  }
}

export class DeviceStatusIcon extends vscode.ThemeIcon {
  constructor(device: Device) {
    const icon = isDeviceOnline(device) ? new OnlineIcon() : new OfflineIcon();
    super(icon.id, icon.color);
  }
}

export class KeyIcon extends vscode.ThemeIcon {
  constructor() {
    super("key");
  }
}

export class EnapterCloudIcon extends vscode.ThemeIcon {
  constructor() {
    super("cloud");
  }
}

export class EnapterGatewayIcon extends vscode.ThemeIcon {
  constructor() {
    super("enapter-gateway");
  }
}

export class StringIcon extends vscode.ThemeIcon {
  constructor() {
    super("symbol-string");
  }
}

export class PropertyIcon extends vscode.ThemeIcon {
  constructor() {
    super("symbol-string");
  }
}

export class TextIcon extends vscode.ThemeIcon {
  constructor() {
    super("symbol-text");
  }
}

export class GlobeIcon extends vscode.ThemeIcon {
  constructor() {
    super("globe");
  }
}

export class IdIcon extends vscode.ThemeIcon {
  constructor() {
    super("enapter-id");
  }
}

export class CloudUploadIcon extends vscode.ThemeIcon {
  constructor() {
    super("cloud-upload");
  }
}

export class ConnectToSiteIcon extends vscode.ThemeIcon {
  constructor() {
    super("plug");
  }
}

export class DisconnectFromSiteIcon extends vscode.ThemeIcon {
  constructor() {
    super("debug-disconnect");
  }
}

export class PlayIcon extends vscode.ThemeIcon {
  constructor() {
    super("play");
  }
}

export class PlusIcon extends vscode.ThemeIcon {
  constructor() {
    super("plus");
  }
}

export class PauseIcon extends vscode.ThemeIcon {
  constructor() {
    super("debug-pause");
  }
}

export class DirectRunCommandOnClickIcon extends vscode.ThemeIcon {
  constructor() {
    super("play-circle");
  }
}

export class WarningIcon extends vscode.ThemeIcon {
  constructor() {
    super("warning");
  }
}
