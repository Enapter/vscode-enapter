---@meta

---Persistent flash memory storage (blueprint v3).
---Flash has a limited write lifetime (~60M writes of 128-byte values).
---Minimum safe write interval for 10-year lifespan: once per 5 seconds.
---Errors are returned as strings; `nil` indicates success.
---@class storageV3lib
storage = {}

---Writes a value to persistent storage by key.
---Key length is limited to 15 characters.
---@param key string Storage key (max 15 characters)
---@param value string|nil Value to store, or `nil` to remove the key (same as `storage.remove`)
---@return string|nil nil on success, error message on failure
function storage.write(key, value) end

---Reads a value from persistent storage by key.
---@param key string Storage key
---@return string|nil, string|nil Value string or `nil` if not set or on error; error message or nil
function storage.read(key) end

---Removes a value from persistent storage by key.
---@param key string Storage key
---@return string|nil nil on success, error message on failure
function storage.remove(key) end
