---@meta

---ENP-RS485 serial communication.
---Must be initialized with `rs485.init` before any other call or before using `modbus`.
---@class rs485V1lib
rs485 = {}

---Initializes hardware for RS-485 serial communication.
---@param baud_rate number Baud rate (e.g. 9600, 115200)
---@param data_bits number Data bits, range 5–8
---@param parity "O"|"E"|"N" Parity: `"O"`=odd, `"E"`=even, `"N"`=disabled
---@param stop_bits 1|2 Number of stop bits
---@param buffer_size? number Receive buffer size in bytes (optional, max 4096)
---@return number 0 on success, otherwise error code (use `rs485.err_to_str` to convert)
function rs485.init(baud_rate, data_bits, parity, stop_bits, buffer_size) end

---Sends data over the RS-485 interface.
---By default flushes the receive buffer before sending (useful for request-response protocols).
---@param data string Data to send (handled as a byte array)
---@param do_flush? boolean Flush incoming data buffer before send, default is `true`
---@return number 0 on success, otherwise error code (use `rs485.err_to_str` to convert)
function rs485.send(data, do_flush) end

---Receives a data chunk from the RS-485 network.
---Read additional chunks if the full packet is not received in one call.
---@param timeout number Time to wait for a response in milliseconds
---@param max_data_size? number Maximum chunk size in bytes (default 1024, max 4096)
---@return string|nil, number Data string or `nil` on error; error code
function rs485.receive(timeout, max_data_size) end

---Returns a human-readable string for an `rs485` function error code.
---@param error number Error code returned by an `rs485` function
---@return string Human-readable error description
function rs485.err_to_str(error) end
