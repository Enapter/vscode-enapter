---@meta

---Built-in red LED controller.
---The LED is exclusively controlled by the Lua script and can be used for custom indications.
---@class ledV1lib
led = {}

---Turns on the built-in red LED.
function led.on() end

---Turns off the built-in red LED.
function led.off() end

---Starts blinking the built-in red LED with equal on/off intervals.
---@param duration number Duration of LED being on and off in milliseconds
function led.blink(duration) end
