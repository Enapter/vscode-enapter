---@meta

---UCM system interface (blueprint v3).
---@class systemV3lib
system = {}

---Returns current UCM uptime in seconds.
---@return number Uptime in seconds
function system.uptime() end

---Delays script execution for the specified duration.
---@param delay? number Delay in milliseconds; default 1000, maximum 5000
function system.delay(delay) end
