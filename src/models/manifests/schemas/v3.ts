/**
 * List of implement device profiles
 */
export type Implements = string | string[];
/**
 * Lua firmware should send/accept data according to type declarations. Supported types are: boolean, string, integer, float, json
 */
export type TypeField = "boolean" | "string" | "integer" | "float" | "array_of_strings" | "json";
/**
 * List of aliases for command, property or telemetry attribute
 */
export type Aliases = string | string[];
/**
 * Enumerables restrict possible field values. Values should be of the same type as defined in `type` field.
 */
export type EnumField =
  | (string | number)[]
  | {
      [k: string]: EnumItemField;
    };
export type AccessLevel = "readonly" | "user" | "owner" | "installer" | "vendor" | "system";

/**
 * Device Blueprint for Enapter Cloud
 */
export interface BlueprintManifest {
  /**
   * Version of Enapter Cloud Blueprint used for this manifest
   */
  blueprint_spec: "device/3.0";
  implements?: Implements;
  implements_draft?: Implements;
  /**
   * Category of the device. It is used to group devices in the Cloud UI.
   */
  category?:
    | "hydrogen-storage"
    | "electrolysers"
    | "solar-generators"
    | "fuel-cells"
    | "water-treatment"
    | "battery-systems"
    | "power-meters"
    | "hvac"
    | "electric-vehicles"
    | "control"
    | "data-providers"
    | "sensors";
  /**
   * Display name to be shown to users in Blueprints Marketplace.
   */
  display_name: string;
  /**
   * Description to be shown to users in Blueprints Marketplace.
   */
  description?: string;
  /**
   * Device icon to show in the UI. Must be one from [the full list of available icons](https://static.enapter.com/rn/icons/material-community.html).
   */
  icon?: string;
  /**
   * Properties are Device metadata which unlike telemetry does not change during device normal operation. It could be firmware version, device model, serial number and similar.
   */
  properties?: {
    [k: string]: Property;
  };
  /**
   * Telemetry contains of Device's metrics or states which must be tracked during device operations as a timeseries data. For example, sensors data and internal device states goes into this category.
   */
  telemetry?: {
    [k: string]: TelemetryAttribute;
  };
  /**
   * Commands could be grouped. If command groups are declared, it's required to set group ID for each command. It's not necessary to use groups, but convenient when device has many commands.
   */
  command_groups?: {
    [k: string]: CommandGroup;
  };
  /**
   * Commands which can be performed on device. Lua firmware on the module must implement methods with names according to command IDs
   */
  commands?: {
    [k: string]: Command;
  };
  /**
   * Alerts are faulty device states, e.g. "overheated heatsink".
   * Lua firmware must send IDs of these alerts in `alerts` field inside telemetry JSON if device is in active alert state. All IDs sent by device, that not declared in this list will still be considered as alerts of severity `error` with display_name equal to alert ID.
   */
  alerts?: {
    [k: string]: Alert;
  };
  /**
   * In some cases we need to preprocess incoming device telemetry in Cloud. For example to parse bitmask (effective way to transfer many boolean values) into several boolean telemetry fields (more verbose and user-friendly way).
   */
  telemetry_preprocessor?: {
    lua_file: string;
    [k: string]: unknown;
  };
  /**
   * User input for command request may require preprocessing. Or one high-level user-friendly command can be split into several specific commands implemented in Lua firmware. Virtual commands can be used to achieve this.
   */
  virtual_commands?: {
    lua_file: string;
    [k: string]: unknown;
  };
  runtime: Runtime;
  /**
   * Blueprint author username on GitHub.
   */
  author?: string;
  /**
   * Users, who have contributed to this blueprint.
   */
  contributors?: string[];
  support?: Support;
  /**
   * License type, which blueprint based on.
   */
  license?: string;
  /**
   * Contains custom units which are not supported by UCUM but make sense for user.
   */
  units?: {
    [k: string]: Unit;
  };
  /**
   * Configuration settings for the device.
   */
  configuration?: {
    [k: string]: ConfigurationBucket;
  };
  /**
   * This interface was referenced by `BlueprintManifest`'s JSON-Schema definition
   * via the `patternProperty` "^\.\w*$".
   */
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z][A-Za-z0-9_]*$".
 */
export interface Property {
  type: TypeField;
  implements?: Implements;
  aliases?: Aliases;
  /**
   * Unit identifier, used in charts and telemetry-related UIs. Most of the commonly used units are covered in the supported units list (https://ucum.org/docs/common-units). You can still provide your own units via global units section.
   */
  unit?: string;
  /**
   * Allow to use C unit symbol as Coulomb. It's frequently missused for Celsius and this option allows to disable validation warning.
   */
  allow_unit_c?: boolean;
  /**
   * Allow to use F unit symbol as Farad. It's frequently missused for Fahrenheit and this option allows to disable validation warning.
   */
  allow_unit_f?: boolean;
  /**
   * Specifies the units to which the property value can be scaled within the UI.
   */
  auto_scale?: string[];
  /**
   * Display name which will be shown to the users in the UI.
   */
  display_name: string;
  /**
   * Optional property description is shown to user in UIs. If not given, description will be empty.
   */
  description?: string;
  enum?: EnumField;
  /**
   * User should have required access level for reading property
   */
  access_level?: "readonly" | "user" | "owner" | "installer" | "vendor" | "system";
  [k: string]: unknown;
}
/**
 * One of the possible fields' values.
 */
export interface EnumItemField {
  /**
   * Display name which will be shown to the users in the UI.
   */
  display_name?: string;
  /**
   * Optional description to show in UIs. If not provided, will be omitted.
   */
  description?: string;
  /**
   * Optional color to show in UIs. If not provided, will be omitted.
   */
  color?:
    | "blue-lighter"
    | "blue-light"
    | "blue"
    | "blue-dark"
    | "blue-darker"
    | "yellow-lighter"
    | "yellow-light"
    | "yellow"
    | "yellow-dark"
    | "yellow-darker"
    | "green-lighter"
    | "green-light"
    | "green"
    | "green-dark"
    | "green-darker"
    | "red-lighter"
    | "red-light"
    | "red"
    | "red-dark"
    | "red-darker"
    | "cyan-lighter"
    | "cyan-light"
    | "cyan"
    | "cyan-dark"
    | "cyan-darker"
    | "pink-lighter"
    | "pink-light"
    | "pink"
    | "pink-dark"
    | "pink-darker"
    | "purple-lighter"
    | "purple-light"
    | "purple"
    | "purple-dark"
    | "purple-darker"
    | "orange-lighter"
    | "orange-light"
    | "orange"
    | "orange-dark"
    | "orange-darker";
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z][A-Za-z0-9_]*$".
 */
export interface TelemetryAttribute {
  type: TypeField;
  implements?: Implements;
  aliases?: Aliases;
  /**
   * Display name which will be shown to the users in the UI.
   */
  display_name: string;
  /**
   * Optional property description is shown to user in UIs. If not given, description will be empty.
   */
  description?: string;
  enum?: EnumField;
  /**
   * Unit identifier, used in charts and telemetry-related UIs. Most of the commonly used units are covered in the supported units list (https://ucum.org/docs/common-units). You can still provide your own units via global units section.
   */
  unit?: string;
  /**
   * Allow to use C unit symbol as Coulomb. It's frequently missused for Celsius and this option allows to disable validation warning.
   */
  allow_unit_c?: boolean;
  /**
   * Allow to use F unit symbol as Farad. It's frequently missused for Fahrenheit and this option allows to disable validation warning.
   */
  allow_unit_f?: boolean;
  /**
   * Specifies the units to which the telemetry value can be scaled within the UI.
   */
  auto_scale?: string[];
  /**
   * User should have required access level for reading telemetry
   */
  access_level?: "readonly" | "user" | "owner" | "installer" | "vendor" | "system";
  /**
   * JSON schema or path to file with it
   */
  json_schema?: string;
  [k: string]: unknown;
}
export interface CommandGroup {
  /**
   * Display name which will be shown as a heading of the commands group on the commands screen.
   */
  display_name: string;
  /**
   * Optional command group description to show in UIs. If not provided, will be omitted.
   */
  description?: string;
  ui?: {
    /**
     * Optional command icon, string key from [Material UI](https://static.enapter.com/rn/icons/material-community.html)
     */
    icon?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z][A-Za-z0-9_]*$".
 */
export interface Command {
  implements?: Implements;
  aliases?: Aliases;
  /**
   * Define in which command group this command will belong to. Should match with one of the command groups name. Refer to `command_groups` field description
   */
  group: string;
  /**
   * Display name which will be shown to the users in the UI.
   */
  display_name: string;
  /**
   * Optional command description to show in UIs. If not provided, will be omitted.
   */
  description?: string;
  /**
   * Arguments to be supplied to command. Corresponding function in Lua firmware should accept these as a named arguments.
   */
  arguments?: {
    [k: string]: CommandArgument;
  };
  /**
   * Response returned by the command after execution.
   */
  response?: {
    [k: string]: CommandResponse;
  };
  /**
   * Virtual commands are not implemented in device Lua firmware. Instead communication module's `virtual_commands.lua` runs in Cloud and translates this command into another command calls, which in it's turn are implemented in device Lua firmware. Commands marked as `virtual` must be defined as a function in `virtual_commands.lua`.
   */
  virtual?: boolean;
  ui?: {
    /**
     * Optional command icon, string key from [Material UI](https://static.enapter.com/rn/icons/material-community.html)
     */
    icon?: string;
    /**
     * Optional property for displaying command in quick access command menu in mobile
     */
    mobile_quick_access?: boolean;
    [k: string]: unknown;
  };
  confirmation?: {
    /**
     * Main text for confirmation dialog before execution command
     */
    description?: string;
    /**
     * Severity level for confirmation dialog
     */
    severity: "info" | "warning";
    /**
     * Title for confirmation dialog before execution command
     */
    title: string;
    [k: string]: unknown;
  };
  /**
   * User should have required access level for executing command
   */
  access_level?: "readonly" | "user" | "owner" | "installer" | "vendor" | "system";
  /**
   * The name of the command which should be used for reading the values for the arguments form pre-population. This read command should return a Lua table with the same keys as the arguments in the write command.
   */
  populate_values_command?: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z][A-Za-z0-9_]*$".
 */
export interface CommandArgument {
  /**
   * Display name which will be shown to the users in the UI.
   */
  display_name: string;
  /**
   * A more detailed description of the argument. It will be shown next to the argument field in the arguments form.
   */
  description?: string;
  required?: boolean;
  type: TypeField;
  min?: number;
  max?: number;
  enum?: EnumField;
  /**
   * Predefined format for string type can be used.
   */
  format?: string;
  /**
   * JSON schema or path to file with it
   */
  json_schema?: string;
  sensitive?: boolean;
  /**
   * Default value to be supplied to command if is not present in user input. Must be the same type as declared type of the argument
   */
  default?: string | number | boolean;
  [k: string]: unknown;
}
export interface CommandResponse {
  type: TypeField;
  required?: boolean;
  enum?: EnumField;
  /**
   * Predefined format for string type can be used.
   */
  format?: string;
  /**
   * JSON schema or path to file with it
   */
  json_schema?: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z0-9_-]+$".
 */
export interface Alert {
  /**
   * Supported severities are: info, warning, error.
   */
  severity: "info" | "warning" | "error";
  /**
   * Vendor-specific alert code, which may be useful, for example, for checking in the device manual.
   */
  code?: string;
  /**
   * Period in duration format (1m, 2m30s) when soft fail become hard fail. If empty grace period is equal zero.
   */
  grace_period?: string;
  /**
   * Display name which will be shown to the users in the UI.
   */
  display_name: string;
  /**
   * Optional alert description to show in UIs. If not provided, will be omitted.
   */
  description?: string;
  /**
   * Troubleshooting steps to show in UIs.
   */
  troubleshooting?: string[];
  /**
   * Telemetry attributes that are related to the alert.
   */
  telemetry?: string[];
  /**
   * Device components that are related to the alert.
   */
  components?: string[];
  /**
   * Conditions which may cause the alert raising.
   */
  conditions?: string[];
  [k: string]: unknown;
}
/**
 * The runtime section describes the type of runtime, options, and requirements necessary to implement device integration.
 */
export interface Runtime {
  type: "lua" | "embedded";
  /**
   * The options section describes options that may be needed to configure runtime.
   */
  options?: LuaOptions;
  /**
   * Requirements describe what is needed for the blueprint to function successfully. This field provides information on where to run the blueprint.
   */
  requirements?: string[];
  [k: string]: unknown;
}
/**
 * Options describe settings that may needed for lua runtime.
 */
export interface LuaOptions {
  /**
   * Directory with Lua files. It should contain main.lua as an entrypoint. Cannot be used alongside with file.
   */
  dir?: string;
  /**
   * Lua script. Cannot be used alongside with dir.
   */
  file?: string;
  /**
   * Rockspec file name. Cannot be used alongside with luarocks.
   */
  rockspec?: string;
  /**
   * Lua script dependencies. Every item is a rockspec package. Cannot be used alongside with rockspec.
   */
  luarocks?: string[];
  /**
   * Allow to use luarocks dev packages.
   */
  allow_dev_luarocks?: boolean;
  /**
   * Optional mode to use for amalgamation.
   */
  amalg_mode?: ("isolate" | "nodebug") | ("isolate" | "nodebug")[];
  [k: string]: unknown;
}
/**
 * Support information contains web address and email.
 */
export interface Support {
  /**
   * Web address when user can to get any support about blueprint.
   */
  url?: string;
  /**
   * Email address for user's support mails.
   */
  email?: string;
  [k: string]: unknown;
}
/**
 * User-defined unit
 */
export interface Unit {
  /**
   * Unit's representation in UI
   */
  symbol: string;
  /**
   * Unit's text representation
   */
  display_name?: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z][A-Za-z0-9_]*$".
 */
export interface ConfigurationBucket {
  /**
   * Display name for the configuration bucket.
   */
  display_name: string;
  /**
   * Description of the configuration bucket.
   */
  description?: string;
  access_level?: AccessLevel;
  /**
   * Indicates if virtual commands for read and write configuration should be used.
   */
  virtual_commands?: boolean;
  ui?: {
    /**
     * Optional command icon, string key from [Material UI](https://static.enapter.com/rn/icons/material-community.html)
     */
    icon?: string;
    [k: string]: unknown;
  };
  parameters: {
    [k: string]: ConfigurationParameter;
  };
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[A-Za-z][A-Za-z0-9_]*$".
 */
export interface ConfigurationParameter {
  /**
   * Display name for the parameter.
   */
  display_name: string;
  type: TypeField;
  /**
   * Default value to be supplied to command if is not present in user input. Must be the same type as declared type of the argument
   */
  default?: string | number | boolean;
  /**
   * Indicates if the parameter is required.
   */
  required?: boolean;
  /**
   * Indicates if the parameter is sensitive.
   */
  sensitive?: boolean;
  /**
   * Predefined format for string type can be used.
   */
  format?: string;
  [k: string]: unknown;
}
