---@meta

---Analog output client object (blueprint v3).
---Obtained via `analogout.new()`.
---@class AnalogOutClientV3

---Sets output voltage in Volts.
---@param voltage number Voltage to set in Volts
---@return string|nil nil on success, error message on failure
function AnalogOutClientV3:set_volts(voltage) end

---Sets output current in Amperes.
---Not available on ENP-AO4.
---@param amperage number Current to set in Amperes
---@return string|nil nil on success, error message on failure
function AnalogOutClientV3:set_amps(amperage) end

---Analog output library (blueprint v3, OO-style).
---@class analogoutV3lib
analogout = {}

---Creates a new analog output client.
---@param connection_uri string e.g. `"port://ao-1"`
---@return AnalogOutClientV3|nil, string|nil Client or nil; error message or nil
function analogout.new(connection_uri) end
