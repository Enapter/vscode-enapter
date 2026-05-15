---@meta

---Command execution context passed to command handlers.
---@class EnapterCommandContextV1
local EnapterCommandContextV1 = {}

---Sends a log entry scoped to the current command execution.
---Command logs are always persisted and can be retrieved after command execution.
---@param text string Log message
---@param severity? "debug"|"info"|"warning"|"error" Log severity, default is "info"
function EnapterCommandContextV1:log(text, severity) end

---Terminates command handler execution and marks the command as failed.
---@param text string Error message or payload
function EnapterCommandContextV1:error(text) end

---@alias EnapterCommandHandlerV1 fun(ctx: EnapterCommandContextV1, args: table<string, any>): any

---Enapter Cloud interface.
---@class enapterV1lib
enapter = {}

---Sends properties data to Enapter Cloud.
---Keys must match property reference names declared in `manifest.yml`.
---@param data table<string, any> Property key-value pairs
---@return number 0 on success, otherwise error code (use `enapter.err_to_str` to convert)
function enapter.send_properties(data) end

---Sends telemetry data to Enapter Cloud.
---Keys must match telemetry attribute reference names declared in `manifest.yml`.
---@param data table<string, any> Telemetry key-value pairs
---@return number 0 on success, otherwise error code (use `enapter.err_to_str` to convert)
function enapter.send_telemetry(data) end

---Sends one log entry to Enapter Cloud.
---@param text string Log message
---@param severity? "debug"|"info"|"warning"|"error" Log severity, default is "info"
---@param persist? boolean Persist log entry in Cloud for later retrieval, default is false
function enapter.log(text, severity, persist) end

---Registers a handler function for the named command.
---The command must be declared in `manifest.yml` under the same reference name.
---@param name string Command reference name as declared in `manifest.yml`
---@param handler EnapterCommandHandlerV1 Function called when the command is received
function enapter.register_command_handler(name, handler) end

---Registers a function to be called when connection status to Enapter Cloud or Gateway changes.
---@param handler fun(status: boolean) Called with `true` when connected, `false` when disconnected
function enapter.on_connection_status_changed(handler) end

---Returns current connection status.
---@return boolean `true` if connected, `false` if disconnected
function enapter.get_connection_status() end

---Returns a human-readable string for an `enapter` function error code.
---@param error number Error code returned by an `enapter` function
---@return string Human-readable error description
function enapter.err_to_str(error) end
