---@meta

---Periodic function scheduler (blueprint v3).
---@class schedulerV3lib
scheduler = {}

---Schedules a function for periodic execution.
---Each call is limited to 10 seconds; scheduled calls run sequentially on a single core.
---@param period number Execution interval in milliseconds
---@param fn function Function to execute periodically
---@return number Scheduled function ID (use with `scheduler.remove`)
function scheduler.add(period, fn) end

---Removes a scheduled function by ID.
---@param jobId number Scheduled function ID returned by `scheduler.add`
function scheduler.remove(jobId) end
