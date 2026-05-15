---@meta

---Analog input client object (blueprint v3).
---Replaces the v1 `ai4` global.
---Obtained via `analogin.new()`.
---@class AnalogInClientV3

---Returns the current voltage in Volts.
---Not available on ENP-AI4-20MA.
---@return number|nil, string|nil Voltage in Volts or nil; error message or nil
function AnalogInClientV3:get_volts() end

---Returns the current in Amperes.
---Not available on ENP-AI4-50V.
---@return number|nil, string|nil Current in Amperes or nil; error message or nil
function AnalogInClientV3:get_amps() end

---Returns the temperature in degrees Celsius.
---Only available on ENP-AI6 M2.
---@return number|nil, string|nil Temperature in °C or nil; error message or nil
function AnalogInClientV3:get_temperature() end

---Analog input library (blueprint v3, OO-style).
---Replaces the v1 `ai4` global.
---@class analoginV3lib
analogin = {}

---Creates a new analog input client.
---@param connection_uri string e.g. `"port://ai-1"`
---@return AnalogInClientV3|nil, string|nil Client or nil; error message or nil
function analogin.new(connection_uri) end
