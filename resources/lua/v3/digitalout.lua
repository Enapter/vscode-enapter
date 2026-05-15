---@meta

---Digital output client object (blueprint v3).
---Obtained via `digitalout.new()`.
---@class DigitalOutClientV3

---Sets the output state.
---@param state digitalout.HIGH|digitalout.LOW State to set
---@return string|nil nil on success, error message on failure
function DigitalOutClientV3:set_state(state) end

---Returns the current output state.
---@return digitalout.HIGH|digitalout.LOW, string|nil State; error message or nil
function DigitalOutClientV3:get_state() end

---Digital output library (blueprint v3, OO-style).
---@class digitaloutV3lib
digitalout = {}

---Output is open (low state).
digitalout.LOW = 0

---Output is closed (high state).
digitalout.HIGH = 1

---Creates a new digital output client.
---@param connection_uri string e.g. `"port://do-1"`
---@return DigitalOutClientV3|nil, string|nil Client or nil; error message or nil
function digitalout.new(connection_uri) end
