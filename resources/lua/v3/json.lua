---@meta

---JSON encode/decode library (blueprint v3).
---@class jsonV3lib
json = {}

---Encodes a Lua value to a JSON string.
---@param value string|number|boolean|table|nil Value to encode
---@return string|nil JSON string, or nil on failure
function json.encode(value) end

---Decodes a JSON string to a Lua value.
---@param value string JSON string to decode
---@return string|number|boolean|table, string|nil Decoded value; error message or nil
function json.decode(value) end
