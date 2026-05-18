---@meta

---Persistent flash memory storage.
---Flash has a limited write lifetime (~60M writes of 128-byte values).
---Minimum safe write interval for 10-year lifespan: once per 5 seconds.
---@class storageV1lib
storage = {}

---Writes a value to persistent storage by key.
---Key length is limited to 15 characters.
---@param key string Storage key (max 15 characters)
---@param value string Value to store
---@return number 0 on success, otherwise error code (use `storage.err_to_str` to convert)
function storage.write(key, value) end

---Reads a value from persistent storage by key.
---@param key string Storage key
---@return string|nil, number Value string or `nil` if not set or on error; error code
function storage.read(key) end

---Removes a value from persistent storage by key.
---@param key string Storage key
---@return number 0 on success, otherwise error code (use `storage.err_to_str` to convert)
function storage.remove(key) end

---Returns a human-readable string for a `storage` function error code.
---@param error number Error code returned by a `storage` function
---@return string Human-readable error description
function storage.err_to_str(error) end
