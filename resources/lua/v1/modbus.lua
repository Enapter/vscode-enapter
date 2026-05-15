---@meta

---Modbus RTU communication for ENP-RS232 and ENP-RS485 modules.
---Initialize communication with `rs232.init` or `rs485.init` before use.
---UCM automatically handles Big-Endian to Little-Endian conversion for register values.
---@class modbusV1lib
modbus = {}

---Reads coil registers (Modbus function 0x01).
---@param address number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, number Register contents table or `nil` on error; error code
function modbus.read_coils(address, start_register, registers_count, timeout) end

---Reads discrete input registers (Modbus function 0x02).
---@param address number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, number Register contents table or `nil` on error; error code
function modbus.read_discrete_inputs(address, start_register, registers_count, timeout) end

---Reads holding registers (Modbus function 0x03).
---@param address number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, number Register contents table or `nil` on error; error code
function modbus.read_holdings(address, start_register, registers_count, timeout) end

---Reads input registers (Modbus function 0x04).
---@param address number Modbus device address
---@param start_register number First register number to read
---@param registers_count number Number of registers to read
---@param timeout number Time to wait for response in milliseconds
---@return table|nil, number Register contents table or `nil` on error; error code
function modbus.read_inputs(address, start_register, registers_count, timeout) end

---Writes a single coil register (Modbus function 0x05).
---@param address number Modbus device address
---@param register number Register number to write to
---@param value number Value to write
---@param timeout number Time to wait for response in milliseconds
---@return number 0 on success, otherwise error code (use `modbus.err_to_str` to convert)
function modbus.write_coil(address, register, value, timeout) end

---Writes a single holding register (Modbus function 0x06).
---@param address number Modbus device address
---@param register number Register number to write to
---@param value number Value to write
---@param timeout number Time to wait for response in milliseconds
---@return number 0 on success, otherwise error code (use `modbus.err_to_str` to convert)
function modbus.write_holding(address, register, value, timeout) end

---Writes multiple coil registers (Modbus function 0x0F).
---@param address number Modbus device address
---@param start_register number First register number to write to
---@param values table Array of integer values to write to consecutive registers
---@param timeout number Time to wait for response in milliseconds
---@return number 0 on success, otherwise error code (use `modbus.err_to_str` to convert)
function modbus.write_multiple_coils(address, start_register, values, timeout) end

---Writes multiple holding registers (Modbus function 0x10).
---@param address number Modbus device address
---@param start_register number First register number to write to
---@param values table Array of integer values to write to consecutive registers
---@param timeout number Time to wait for response in milliseconds
---@return number 0 on success, otherwise error code (use `modbus.err_to_str` to convert)
function modbus.write_multiple_holdings(address, start_register, values, timeout) end

---Returns a human-readable string for a `modbus` function error code.
---@param error number Error code returned by a `modbus` function
---@return string Human-readable error description
function modbus.err_to_str(error) end
