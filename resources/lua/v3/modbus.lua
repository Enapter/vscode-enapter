---@meta

---Modbus client object (blueprint v3, OO-style).
---Obtained via `modbus.new()`.
---@class ModbusClientV3

---Reads coil registers (Modbus function 0x01).
---@param unit_id number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, string|nil Register contents table or nil; error message or nil
function ModbusClientV3:read_coils(unit_id, start_register, registers_count, timeout) end

---Reads discrete input registers (Modbus function 0x02).
---@param unit_id number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, string|nil Register contents table or nil; error message or nil
function ModbusClientV3:read_discrete_inputs(unit_id, start_register, registers_count, timeout) end

---Reads holding registers (Modbus function 0x03).
---@param unit_id number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, string|nil Register contents table or nil; error message or nil
function ModbusClientV3:read_holdings(unit_id, start_register, registers_count, timeout) end

---Reads input registers (Modbus function 0x04).
---@param unit_id number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, string|nil Register contents table or nil; error message or nil
function ModbusClientV3:read_inputs(unit_id, start_register, registers_count, timeout) end

---Writes a single coil register (Modbus function 0x05).
---@param unit_id number Modbus device address
---@param register number Register number to write to
---@param value number Value to write
---@param timeout number Time to wait for response in milliseconds
---@return string|nil nil on success, error message on failure
function ModbusClientV3:write_coil(unit_id, register, value, timeout) end

---Writes a single holding register (Modbus function 0x06).
---@param unit_id number Modbus device address
---@param register number Register number to write to
---@param value number Value to write
---@param timeout number Time to wait for response in milliseconds
---@return string|nil nil on success, error message on failure
function ModbusClientV3:write_holding(unit_id, register, value, timeout) end

---Writes multiple coil registers (Modbus function 0x0F).
---@param unit_id number Modbus device address
---@param start_register number First register number to write to
---@param values table Array of integer values to write to consecutive registers
---@param timeout number Time to wait for response in milliseconds
---@return string|nil nil on success, error message on failure
function ModbusClientV3:write_multiple_coils(unit_id, start_register, values, timeout) end

---Writes multiple holding registers (Modbus function 0x10).
---@param unit_id number Modbus device address
---@param start_register number First register number to write to
---@param values table Array of integer values to write to consecutive registers
---@param timeout number Time to wait for response in milliseconds
---@return string|nil nil on success, error message on failure
function ModbusClientV3:write_multiple_holdings(unit_id, start_register, values, timeout) end

---Reads multiple registers in one batched operation.
---Each query specifies: `type` ("inputs","coils","holdings","discrete_inputs"), `addr`, `reg`, `count`, `timeout`.
---@param queries table Array of read query tables
---@return table|nil, string|nil Results array or nil; error message or nil
function ModbusClientV3:read(queries) end

---Writes multiple registers in one batched operation.
---Each query specifies: `type` ("holding","coil","multiple_holdings","multiple_coils"), `addr`, `reg`, `value`/`values`, `timeout`.
---@param queries table Array of write query tables
---@return table|nil, string|nil Results array or nil; error message or nil
function ModbusClientV3:write(queries) end

---Modbus library (blueprint v3, OO-style).
---Use `port://` scheme for Modbus RTU (e.g. `"port://rs485"`), `tcp://` for Modbus TCP.
---@class modbusV3lib
modbus = {}

---Creates a new Modbus client for the given connection URI.
---@param connection_uri string e.g. `"tcp://192.168.1.1:502"` or `"port://rs485"`
---@return ModbusClientV3|nil, string|nil Client or nil; error message or nil
function modbus.new(connection_uri) end
