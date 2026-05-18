---@meta

---CAN monitor object — stores only the most recent message per ID (blueprint v3).
---Obtained via `CanClientV3:monitor()`.
---@class CanMonitorV3

---Returns the latest stored values for the given IDs and clears the monitor.
---Result is indexed in the same order as `ids`; an entry is `nil` if no data was received yet.
---@param ids table List of CAN message IDs
---@return table|nil, string|nil Table of received messages or nil; error message or nil
function CanMonitorV3:pop(ids) end

---CAN queue object — buffers all incoming messages per ID (blueprint v3).
---Obtained via `CanClientV3:queue()`.
---@class CanQueueV3

---Returns all stored messages for the given ID and clears that queue entry.
---@param id number CAN message ID
---@return table|nil, string|nil Array of received frames or nil; error message or nil
function CanQueueV3:pop(id) end

---Returns the number of dropped packets for the given ID since last call.
---@param id number CAN message ID
---@return number|nil, string|nil Drop count or nil; error message or nil
function CanQueueV3:drops_count(id) end

---CAN bus client object (blueprint v3, OO-style).
---Obtained via `can.new()`.
---@class CanClientV3

---Sends a CAN frame.
---@param id number CAN message ID
---@param data string CAN data frame, up to 8 bytes
---@return string|nil nil on success, error message on failure
function CanClientV3:send(id, data) end

---Creates a monitor that keeps only the most recent message per ID.
---@param ids table List of CAN message IDs to monitor
---@return CanMonitorV3|nil, string|nil Monitor or nil; error message or nil
function CanClientV3:monitor(ids) end

---Creates a queue that buffers all incoming messages per ID.
---@param ids table List of CAN message IDs to buffer
---@param size number Maximum number of messages stored per ID
---@param policy can.DROP_OLDEST|can.DROP_NEWEST Drop policy
---@return CanQueueV3|nil, string|nil Queue or nil; error message or nil
function CanClientV3:queue(ids, size, policy) end

---CAN bus library (blueprint v3, OO-style).
---@class canV3lib
can = {}

---Drop policy: drop the oldest buffered entry when the queue is full.
can.DROP_OLDEST = 0

---Drop policy: discard the incoming entry when the queue is full.
can.DROP_NEWEST = 1

---Creates a new CAN bus client.
---@param connection_uri string e.g. `"port://can-1"`
---@return CanClientV3|nil, string|nil Client or nil; error message or nil
function can.new(connection_uri) end
