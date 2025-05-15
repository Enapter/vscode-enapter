import vscode from "vscode";

export interface LogEntry {
  level: vscode.LogLevel;
  message: string;
}

export interface DeviceLogEntry extends LogEntry {
  data: unknown;
}

const severityLogLevelMap: Record<string, vscode.LogLevel> = {
  debug: vscode.LogLevel.Debug,
  info: vscode.LogLevel.Info,
  warning: vscode.LogLevel.Warning,
  error: vscode.LogLevel.Error,
};

function severityToLevel(severity: string | undefined): vscode.LogLevel {
  return severityLogLevelMap[String(severity).toLowerCase()] || severityLogLevelMap.debug;
}

export function toDeviceLog(data: unknown): DeviceLogEntry | undefined {
  if (!data) {
    return undefined;
  }

  try {
    const strData = data.toString();
    const parsed = JSON.parse(strData);

    return {
      level: severityToLevel(parsed.severity),
      message: parsed.message,
      data: data,
    };
  } catch (_) {
    /* do nothing */
  }
}
