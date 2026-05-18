---@meta

---ENP-CAN CAN bus communication.
---Must be initialized with `can.init` before any other call.
---@class canV1lib
can = {}

---@alias CANHandler fun(msg_id: number, data: string)

---Initializes hardware for CAN bus communication.
---@param baud_rate 100|250|500|800|1000 Baud rate in kbps
---@param can_handler? CANHandler Optional handler called for every received CAN packet; receives message ID and data frame (up to 8 bytes as string)
---@return number 0 on success, otherwise error code (use `can.err_to_str` to convert)
function can.init(baud_rate, can_handler) end

---Sends a CAN frame to the CAN bus.
---@param msg_id number CAN message ID
---@param data string CAN data frame, up to 8 bytes
---@return number 0 on success, otherwise error code (use `can.err_to_str` to convert)
function can.send(msg_id, data) end

---Returns a human-readable string for a `can` function error code.
---@param error number Error code returned by a `can` function
---@return string Human-readable error description
function can.err_to_str(error) end
