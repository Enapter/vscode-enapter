from http.server import HTTPServer, BaseHTTPRequestHandler
import io
import zipfile

class ZipHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        zip_data = self.rfile.read(content_length)
        
        try:
            with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_file:
                print("\nReceived ZIP containing:")
                for file_info in zip_file.filelist:
                    print(f"- {file_info.filename} ({file_info.file_size} bytes)")
            
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(b"ZIP file received successfully")
            
        except zipfile.BadZipFile:
            self.send_response(400)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(b"Invalid ZIP file")

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Enapter-Auth-Token')

def run_server(port=8000):
    server = HTTPServer(('', port), ZipHandler)
    print(f"Server running on port {port}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()