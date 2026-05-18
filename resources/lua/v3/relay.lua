---@meta

---Relay client object (blueprint v3).
---Replaces the v1 `rl6` global.
---Obtained via `relay.new()`.
---@class RelayClientV3

---Closes the relay contact (activates the relay).
---@return string|nil nil on success, error message on failure
function RelayClientV3:close() end

---Opens the relay contact (deactivates the relay).
---@return string|nil nil on success, error message on failure
function RelayClientV3:open() end

---Triggers a non-blocking impulse: changes the relay state for `duration` ms then restores it.
---Any other operation on the same relay during the impulse aborts it.
---@param duration number Impulse duration in milliseconds
---@return string|nil nil on success, error message on failure
function RelayClientV3:impulse(duration) end

---Returns the current relay state.
---@return boolean, string|nil `true` if closed, `false` if open; error message or nil
function RelayClientV3:is_closed() end

---Relay library (blueprint v3, OO-style).
---Replaces the v1 `rl6` global.
---@class relayV3lib
relay = {}

---Creates a new relay client.
---@param connection_uri string e.g. `"port://rl-1"`
---@return RelayClientV3|nil, string|nil Client or nil; error message or nil
function relay.new(connection_uri) end
