---@meta

---Command execution context passed to command handlers (v3).
---@class EnapterCommandContextV3
local EnapterCommandContextV3 = {}

---Emits a log message visible in the Enapter UI.
---@param message string Log message
---@param severity? "debug"|"info"|"warning"|"error" Log severity, default is "info"
function EnapterCommandContextV3:log(message, severity) end

---Terminates handler execution and returns a user-facing error.
---@param message string Error message
function EnapterCommandContextV3:error(message) end

---@alias EnapterCommandHandlerV3 fun(ctx: EnapterCommandContextV3, args: table<string, any>): any

---Enapter Cloud interface (blueprint v3).
---@class enapterV3lib
---@field main fun() Blueprint entry-point. Define it in your script: `function enapter.main() ... end`. The runtime calls it automatically on startup.
enapter = {}

---Returns the current connection status to Enapter Cloud or Gateway.
---@return boolean `true` if connected, `false` if disconnected
function enapter.get_connection_status() end

---Sends properties data to Enapter Cloud.
---Keys must match property reference names declared in `manifest.yml`.
---@param data table<string, any> Property key-value pairs
---@return string|nil nil on success, error message on failure
function enapter.send_properties(data) end

---Sends telemetry data to Enapter Cloud.
---Keys must match telemetry attribute reference names declared in `manifest.yml`.
---@param data table<string, any> Telemetry key-value pairs
---@return string|nil nil on success, error message on failure
function enapter.send_telemetry(data) end

---Sends one log entry to Enapter Cloud.
---@param text string Log message
---@param severity? "debug"|"info"|"warning"|"error" Log severity, default is "info"
---@param persist? boolean Persist log entry in Cloud for later retrieval, default is false
function enapter.log(text, severity, persist) end

---Registers a handler function for the named command.
---The command must be declared in `manifest.yml` under the same reference name.
---@param name string Command reference name as declared in `manifest.yml`
---@param handler EnapterCommandHandlerV3 Function called when the command is received
function enapter.register_command_handler(name, handler) end

---Registers a function to be called when connection status to Enapter Cloud or Gateway changes.
---@param handler fun(status: boolean) Called with `true` when connected, `false` when disconnected
function enapter.on_connection_status_changed(handler) end
