---@meta

---UCM system interface.
---Requires Lua API version 1.1 or later.
---@class systemV1lib
system = {}

---Returns current UCM uptime in seconds.
---@return number Uptime in seconds
function system.uptime() end

---Delays script execution for the specified duration.
---@param delay? number Delay in milliseconds; default 1000, maximum 5000
function system.delay(delay) end
