---@meta

---Device configuration interface (blueprint v3 only).
---Values come from the `configuration:` section of `manifest.yml`.
---@class configurationV3lib
configuration = {}

---Returns `true` if all required parameters in a configuration group are set.
---@param group string Configuration group name as declared in `manifest.yml`
---@return boolean `true` if all required parameters are set, `false` otherwise
function configuration.is_all_required_set(group) end

---Reads all parameters of a configuration group.
---Returns `nil` and an error message if the group is not configured or a required parameter is missing.
---@param group string Configuration group name as declared in `manifest.yml`
---@return table<string, any>|nil, string|nil Parameter table or nil; error message or nil
function configuration.read(group) end

---Registers a callback that fires when the user changes configuration for the group.
---Use this to reset the client so it is recreated with the updated settings.
---@param group string Configuration group name as declared in `manifest.yml`
---@param callback fun() Function called after the configuration group is written
function configuration.after_write(group, callback) end
