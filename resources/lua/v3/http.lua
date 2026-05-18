---@meta

---HTTP response headers object (blueprint v3).
---@class HttpResponseHeadersV3

---Returns the first value of the named response header.
---@param name string Header name (case-insensitive)
---@return string Header value
function HttpResponseHeadersV3:get(name) end

---Returns all values of the named response header.
---@param name string Header name (case-insensitive)
---@return table Array of header values
function HttpResponseHeadersV3:values(name) end

---HTTP response object (blueprint v3).
---@class HttpResponseV3
---@field code number HTTP response status code
---@field body string Response body as a string
---@field headers HttpResponseHeadersV3 Response headers
---@field cookies table Response cookies list

---HTTP request object (blueprint v3).
---Build with `http.request()`, then send with `HttpClientV3:do_request()`.
---@class HttpRequestV3

---Sets HTTP Basic Authentication on the request.
---@param username string Username
---@param password string Password
function HttpRequestV3:set_basic_auth(username, password) end

---Sets a request header.
---@param name string Header name
---@param value string Header value
function HttpRequestV3:set_header(name, value) end

---Adds a cookie to the request.
---@param name string Cookie name
---@param value string Cookie value
function HttpRequestV3:add_cookie(name, value) end

---HTTP client object with configurable options (blueprint v3).
---Created via `http.client()`.
---@class HttpClientV3

---Performs a GET request.
---@param url string URL to request
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function HttpClientV3:get(url) end

---Performs a POST request.
---@param url string URL to request
---@param content_type string Value for the Content-Type header
---@param body string Request body
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function HttpClientV3:post(url, content_type, body) end

---Performs a POST request with URL-encoded form data.
---@param url string URL to request
---@param form_data table<string, string> Form fields
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function HttpClientV3:post_form(url, form_data) end

---Performs a request using a pre-built request object.
---@param request HttpRequestV3 Request built with `http.request()`
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function HttpClientV3:do_request(request) end

---HTTP library (blueprint v3).
---@class httpV3lib
http = {}

---Performs a GET request using the default client.
---@param url string URL to request
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function http.get(url) end

---Performs a POST request using the default client.
---@param url string URL to request
---@param content_type string Value for the Content-Type header
---@param body string Request body
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function http.post(url, content_type, body) end

---Performs a POST request with URL-encoded form data using the default client.
---@param url string URL to request
---@param form_data table<string, string> Form fields
---@return HttpResponseV3|nil, string|nil Response or nil; error message or nil
function http.post_form(url, form_data) end

---Creates a new HTTP client with custom options.
---Supported options: `insecure_tls` (boolean), `enable_cookie_jar` (boolean), `timeout` (number, seconds).
---@param options table Client options table
---@return HttpClientV3 New HTTP client
function http.client(options) end

---Creates a new HTTP request object for use with `HttpClientV3:do_request()`.
---@param method string HTTP method (e.g. `"GET"`, `"POST"`, `"PUT"`)
---@param url string URL to request
---@param body? string Optional request body
---@return HttpRequestV3 New HTTP request
function http.request(method, url, body) end
