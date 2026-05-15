---@meta

---Serial client object (blueprint v3, OO-style).
---Replaces the v1 `rs232` and `rs485` globals.
---Obtained via `serial.new()`.
---@class SerialClientV3

---Clears the input buffer of the serial port.
---@return string|nil nil on success, error message on failure
function SerialClientV3:flush() end

---Reads exactly `count` bytes or waits up to `timeout` milliseconds.
---@param count number Number of bytes to read
---@param timeout number Maximum time to wait in milliseconds
---@return string|nil, string|nil Data string or nil; error message or nil
function SerialClientV3:read(count, timeout) end

---Writes data to the serial port.
---@param data string Data to send (handled as a byte array)
---@return string|nil nil on success, error message on failure
function SerialClientV3:write(data) end

---Executes a transaction with exclusive access to the serial port.
---Useful for request-response protocols to prevent interleaving.
---The return values of `action` are propagated as the return values of `transaction`.
---@param action function Function that performs serial operations
---@return any|nil, string|nil Result of action or nil; error message or nil
function SerialClientV3:transaction(action) end

---Serial communication library (blueprint v3, OO-style).
---Replaces the v1 `rs232` and `rs485` globals.
---@class serialV3lib
serial = {}

---Creates a new serial client for the given connection URI.
---@param connection_uri string e.g. `"port://rs485"` or `"port://rs232"`
---@return SerialClientV3|nil, string|nil Client or nil; error message or nil
function serial.new(connection_uri) end
