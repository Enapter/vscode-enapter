---@meta

---ENP-AI4 analog input module with 4 channels (IDs 1–4).
---Channels are factory-configured for either voltage (ENP-AI4-50V) or current (ENP-AI4-20MA).
---@class ai4V1lib
ai4 = {}

---Returns voltage on the given input channel.
---Voltage range: −50 to +50 V (ENP-AI4-50V variant).
---@param id number Input channel ID (1–4)
---@return number|nil, number Voltage in volts or `nil` on error; error code
function ai4.read_volts(id) end

---Returns current on the given input channel.
---Current range: 0.004–0.02 A (4–20 mA, ENP-AI4-20MA variant).
---@param id number Input channel ID (1–4)
---@return number|nil, number Current in amperes or `nil` on error; error code
function ai4.read_milliamps(id) end

---Returns a human-readable string for an `ai4` function error code.
---@param error number Error code returned by an `ai4` function
---@return string Human-readable error description
function ai4.err_to_str(error) end
