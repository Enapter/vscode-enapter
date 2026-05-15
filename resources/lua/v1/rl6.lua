---@meta

---ENP-RL6 relay module with 6 controllable relays (IDs 1–6).
---@class rl6V1lib
rl6 = {}

---Returns the current state of a relay.
---@param id number Relay ID (1–6)
---@return boolean|nil, number `true`=closed, `false`=opened, `nil` on error; error code
function rl6.get(id) end

---Opens a relay contact.
---@param id number Relay ID (1–6)
---@return number 0 on success, otherwise error code (use `rl6.err_to_str` to convert)
function rl6.open(id) end

---Closes a relay contact.
---@param id number Relay ID (1–6)
---@return number 0 on success, otherwise error code (use `rl6.err_to_str` to convert)
function rl6.close(id) end

---Performs a non-blocking impulse on a relay.
---Changes the relay state for `duration` milliseconds then restores it.
---Any other operation on the same relay during the impulse aborts it.
---@param id number Relay ID (1–6)
---@param duration number Impulse duration in milliseconds
---@return number 0 on success, otherwise error code (use `rl6.err_to_str` to convert)
function rl6.impulse(id, duration) end

---Opens all 6 relay contacts simultaneously.
---@return number 0 on success, otherwise error code (use `rl6.err_to_str` to convert)
function rl6.open_all() end

---Closes all 6 relay contacts simultaneously.
---@return number 0 on success, otherwise error code (use `rl6.err_to_str` to convert)
function rl6.close_all() end

---Simultaneously sets all 6 relay states.
---@param close1 boolean `true` to close relay 1, `false` to open
---@param close2 boolean `true` to close relay 2, `false` to open
---@param close3 boolean `true` to close relay 3, `false` to open
---@param close4 boolean `true` to close relay 4, `false` to open
---@param close5 boolean `true` to close relay 5, `false` to open
---@param close6 boolean `true` to close relay 6, `false` to open
---@return number 0 on success, otherwise error code (use `rl6.err_to_str` to convert)
function rl6.set_all(close1, close2, close3, close4, close5, close6) end

---Returns a human-readable string for an `rl6` function error code.
---@param error number Error code returned by an `rl6` function
---@return string Human-readable error description
function rl6.err_to_str(error) end
