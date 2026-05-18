---@meta

---ENP-DI7 digital input module with 7 channels and counters (IDs 1–7).
---@class di7V1lib
di7 = {}

---Returns whether a digital input is closed (contact made).
---@param id number Digital input ID (1–7)
---@return boolean|nil, number `true`=closed, `false`=opened, `nil` on error; error code
function di7.is_closed(id) end

---Returns whether a digital input is opened (no contact).
---@param id number Digital input ID (1–7)
---@return boolean|nil, number `true`=opened, `false`=closed, `nil` on error; error code
function di7.is_opened(id) end

---Returns the pulse counter value and time since last reset for a digital input.
---@param id number Digital input ID (1–7)
---@return number|nil, number|nil, number Counter value, seconds since last reset, error code
function di7.read_counter(id) end

---Sets the counter value on a digital input.
---@param id number Digital input ID (1–7)
---@param count number Counter value to set
---@return number 0 on success, otherwise error code (use `di7.err_to_str` to convert)
function di7.set_counter(id, count) end

---Sets the anti-bounce (debounce) delay for all digital inputs.
---Default is 100 µs. Units are 100 µs (e.g. pass `10` for 1000 µs).
---@param time number Debounce delay in units of 100 µs
---@return number 0 on success, otherwise error code (use `di7.err_to_str` to convert)
function di7.set_debounce(time) end

---Returns a human-readable string for a `di7` function error code.
---@param error number Error code returned by a `di7` function
---@return string Human-readable error description
function di7.err_to_str(error) end
