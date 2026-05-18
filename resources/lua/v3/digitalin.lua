---@meta

---Digital input client object (blueprint v3).
---Replaces the v1 `di7` global.
---Obtained via `digitalin.new()`.
---@class DigitalInClientV3

---Returns the current input state.
---@return digitalin.LOW|digitalin.HIGH, string|nil State; error message or nil
function DigitalInClientV3:get_state() end

---Returns the current impulse count.
---Only available on Arrakis Mk3/Mk4 virtual UCM.
---@return number|nil, string|nil Count or nil; error message or nil
function DigitalInClientV3:read_counter() end

---Resets impulse counter to zero.
---@return string|nil nil on success, error message on failure
function DigitalInClientV3:reset_counter() end

---Digital input library (blueprint v3, OO-style).
---Replaces the v1 `di7` global.
---@class digitalinV3lib
digitalin = {}

---Input is open (low state).
digitalin.LOW = 0

---Input is closed (high state).
digitalin.HIGH = 1

---Creates a new digital input client.
---@param connection_uri string e.g. `"port://di-1"`
---@return DigitalInClientV3|nil, string|nil Client or nil; error message or nil
function digitalin.new(connection_uri) end
